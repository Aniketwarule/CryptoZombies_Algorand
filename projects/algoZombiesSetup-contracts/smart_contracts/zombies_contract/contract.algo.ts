import {
  Contract,
  Account,
  Asset,
  uint64,
  BoxMap,
  Bytes,
  GlobalState,
  assert,
  Txn,
  Global,
  Uint64,
  ensureBudget,
  itxn,
  bytes,
} from "@algorandfoundation/algorand-typescript";
import { itob } from "@algorandfoundation/algorand-typescript/op";

/**
 * AlgoZombies - Educational Blockchain Game Contract
 * Stores user progress, achievements, and rewards on Algorand blockchain
 */

export class AlgoZombiesContract extends Contract {
  // ============ Global State ============
  public totalUsers = GlobalState<uint64>({ initialValue: Uint64(0) });
  public totalZombies = GlobalState<uint64>({ initialValue: Uint64(0) });
  public contractOwner = GlobalState<Account>();
  public totalLessons = GlobalState<uint64>({ initialValue: Uint64(50) });
  public rewardPerLesson = GlobalState<uint64>({ initialValue: Uint64(100_000) }); // 0.1 ALGO

  // ============ Box Storage Maps ============
  // User state storage
  public userZombieCount = BoxMap<bytes, uint64>({ keyPrefix: Bytes`uzc_` });
  public userCurrentLesson = BoxMap<bytes, uint64>({ keyPrefix: Bytes`ucl_` });
  public userTotalScore = BoxMap<bytes, uint64>({ keyPrefix: Bytes`uts_` });
  public userLastActive = BoxMap<bytes, uint64>({ keyPrefix: Bytes`ula_` });
  public userTotalRewards = BoxMap<bytes, uint64>({ keyPrefix: Bytes`utr_` });
  public userRegistered = BoxMap<bytes, uint64>({ keyPrefix: Bytes`ureg_` });

  // Zombie storage - each field stored separately
  // Key format: zombieId (user_address + zombie_index)
  public zombieName = BoxMap<bytes, bytes>({ keyPrefix: Bytes`zn_` });
  public zombieLevel = BoxMap<bytes, uint64>({ keyPrefix: Bytes`zl_` });
  public zombieDna = BoxMap<bytes, uint64>({ keyPrefix: Bytes`zd_` });
  public zombieWinCount = BoxMap<bytes, uint64>({ keyPrefix: Bytes`zwc_` });
  public zombieLossCount = BoxMap<bytes, uint64>({ keyPrefix: Bytes`zlc_` });
  public zombieCreatedAt = BoxMap<bytes, uint64>({ keyPrefix: Bytes`zca_` });

  // Lesson completion tracking
  public lessonCompleted = BoxMap<bytes, uint64>({ keyPrefix: Bytes`lc_` });

  // Reward history counter per user
  public userRewardCount = BoxMap<bytes, uint64>({ keyPrefix: Bytes`urc_` });

  // ============ Helper Functions ============

  /**
   * Get user key from account address
   */
  private getUserKey(account: Account): bytes {
    return account.bytes;
  }

  /**
   * Create zombie ID key
   * Format: user_address + zombie_index
   */
  private getZombieKey(account: Account, zombieIndex: uint64): bytes {
    return account.bytes.concat(itob(zombieIndex));
  }

  /**
   * Create lesson completion key
   * Format: user_address + lesson_id
   */
  private getLessonKey(account: Account, lessonId: uint64): bytes {
    return account.bytes.concat(itob(lessonId));
  }

  /**
   * Assert user is registered
   */
  private assertUserRegistered(account: Account): void {
    const userKey: bytes = this.getUserKey(account);
    assert(this.userRegistered(userKey).exists, "User not registered");
    assert(this.userRegistered(userKey).value === Uint64(1), "User not registered");
  }

  /**
   * Reset user daily activity if needed
   */
  private updateLastActive(account: Account): void {
    const userKey: bytes = this.getUserKey(account);
    this.userLastActive(userKey).value = Global.latestTimestamp;
  }

  // ============ Core Contract Methods ============

  /**
   * Initialize the contract on creation
   */
  public createApplication(): void {
    this.contractOwner.value = Txn.sender;
    this.totalUsers.value = Uint64(0);
    this.totalZombies.value = Uint64(0);
    this.totalLessons.value = Uint64(50);
    this.rewardPerLesson.value = Uint64(100_000); // 0.1 ALGO in microAlgos
  }

  /**
   * Register a new user (Opt-in equivalent)
   * Users must call this before using the platform
   */
  public registerUser(): boolean {
    ensureBudget(10000);

    const userKey: bytes = this.getUserKey(Txn.sender);

    // Check if already registered
    assert(!this.userRegistered(userKey).exists || this.userRegistered(userKey).value === Uint64(0), "User already registered");

    // Initialize user state
    this.userRegistered(userKey).value = Uint64(1);
    this.userZombieCount(userKey).value = Uint64(0);
    this.userCurrentLesson(userKey).value = Uint64(1);
    this.userTotalScore(userKey).value = Uint64(0);
    this.userLastActive(userKey).value = Global.latestTimestamp;
    this.userTotalRewards(userKey).value = Uint64(0);
    this.userRewardCount(userKey).value = Uint64(0);

    // Increment total users
    this.totalUsers.value = this.totalUsers.value + Uint64(1);

    return true;
  }

  /**
   * Create a new zombie for the user
   */
  public createZombie(name: bytes, dna: uint64): boolean {
    ensureBudget(10000);

    this.assertUserRegistered(Txn.sender);

    const userKey: bytes = this.getUserKey(Txn.sender);
    const zombieIndex: uint64 = this.userZombieCount(userKey).value;
    const zombieKey: bytes = this.getZombieKey(Txn.sender, zombieIndex);

    // Validate inputs
    assert(dna > Uint64(0), "DNA must be positive");
    assert(name.length > 0, "Name cannot be empty");
    assert(name.length <= 32, "Name too long (max 32 bytes)");

    // Store zombie data
    this.zombieName(zombieKey).value = name;
    this.zombieLevel(zombieKey).value = Uint64(1);
    this.zombieDna(zombieKey).value = dna;
    this.zombieWinCount(zombieKey).value = Uint64(0);
    this.zombieLossCount(zombieKey).value = Uint64(0);
    this.zombieCreatedAt(zombieKey).value = Global.latestTimestamp;

    // Update counters
    this.userZombieCount(userKey).value = zombieIndex + Uint64(1);
    this.totalZombies.value = this.totalZombies.value + Uint64(1);

    this.updateLastActive(Txn.sender);

    return true;
  }

  /**
   * Complete a lesson and earn rewards
   */
  public completeLesson(lessonId: uint64, score: uint64): boolean {
    ensureBudget(10000);

    this.assertUserRegistered(Txn.sender);

    const userKey: bytes = this.getUserKey(Txn.sender);
    const currentLesson: uint64 = this.userCurrentLesson(userKey).value;
    const lessonKey: bytes = this.getLessonKey(Txn.sender, lessonId);

    // Validate lesson progression
    assert(lessonId === currentLesson, "Complete lessons in order");
    assert(lessonId <= this.totalLessons.value, "Invalid lesson ID");
    assert(score > Uint64(0), "Score must be positive");
    assert(score <= Uint64(100), "Score cannot exceed 100");

    // Check if lesson already completed
    assert(!this.lessonCompleted(lessonKey).exists || this.lessonCompleted(lessonKey).value === Uint64(0), "Lesson already completed");

    // Mark lesson as completed
    this.lessonCompleted(lessonKey).value = Uint64(1);

    // Update user progress
    this.userCurrentLesson(userKey).value = currentLesson + Uint64(1);
    this.userTotalScore(userKey).value = this.userTotalScore(userKey).value + score;

    // Calculate reward based on score
    const rewardAmount: uint64 = (this.rewardPerLesson.value * score) / Uint64(100);

    // Update reward tracking
    this.userTotalRewards(userKey).value = this.userTotalRewards(userKey).value + rewardAmount;
    this.userRewardCount(userKey).value = this.userRewardCount(userKey).value + Uint64(1);

    // Send ALGO reward to user via inner transaction
    itxn
      .payment({
        receiver: Txn.sender,
        amount: rewardAmount,
      })
      .submit();

    this.updateLastActive(Txn.sender);

    return true;
  }

  /**
   * DEPRECATED - Merged into completeLesson
   * Internal function to award rewards to user
   */
  private awardReward(user: Account, amount: uint64): void {
    const userKey: bytes = this.getUserKey(user);

    // Update reward tracking
    this.userTotalRewards(userKey).value = this.userTotalRewards(userKey).value + amount;
    this.userRewardCount(userKey).value = this.userRewardCount(userKey).value + Uint64(1);

    // Send ALGO reward to user
    itxn
      .payment({
        receiver: user,
        amount: amount,
      })
      .submit();
  }

  /**
   * Level up a zombie after accumulating wins
   */
  public levelUpZombie(zombieIndex: uint64): boolean {
    ensureBudget(8000);

    this.assertUserRegistered(Txn.sender);

    const userKey: bytes = this.getUserKey(Txn.sender);
    const zombieCount: uint64 = this.userZombieCount(userKey).value;

    assert(zombieIndex < zombieCount, "Invalid zombie index");

    const zombieKey: bytes = this.getZombieKey(Txn.sender, zombieIndex);
    const currentLevel: uint64 = this.zombieLevel(zombieKey).value;
    const winCount: uint64 = this.zombieWinCount(zombieKey).value;

    // Require certain number of wins to level up
    const winsRequired: uint64 = currentLevel * Uint64(3); // 3 wins per level
    assert(winCount >= winsRequired, "Not enough wins to level up");

    // Level up
    this.zombieLevel(zombieKey).value = currentLevel + Uint64(1);

    // Award level up bonus
    const bonusReward: uint64 = Uint64(50_000); // 0.05 ALGO bonus

    // Update reward tracking
    this.userTotalRewards(userKey).value = this.userTotalRewards(userKey).value + bonusReward;
    this.userRewardCount(userKey).value = this.userRewardCount(userKey).value + Uint64(1);

    // Send bonus reward
    itxn
      .payment({
        receiver: Txn.sender,
        amount: bonusReward,
      })
      .submit();

    this.updateLastActive(Txn.sender);

    return true;
  }

  /**
   * Record a battle result for a zombie
   */
  public recordBattle(zombieIndex: uint64, won: boolean): boolean {
    ensureBudget(8000);

    this.assertUserRegistered(Txn.sender);

    const userKey: bytes = this.getUserKey(Txn.sender);
    const zombieCount: uint64 = this.userZombieCount(userKey).value;

    assert(zombieIndex < zombieCount, "Invalid zombie index");

    const zombieKey: bytes = this.getZombieKey(Txn.sender, zombieIndex);

    if (won) {
      // Increment win count
      const currentWins: uint64 = this.zombieWinCount(zombieKey).value;
      this.zombieWinCount(zombieKey).value = currentWins + Uint64(1);

      // Award bonus for milestone wins (every 5 wins)
      const newWins: uint64 = currentWins + Uint64(1);
      if (newWins % Uint64(5) === Uint64(0)) {
        const milestoneReward: uint64 = Uint64(75_000); // 0.075 ALGO
        this.awardReward(Txn.sender, milestoneReward);
      }
    } else {
      // Increment loss count
      const currentLosses: uint64 = this.zombieLossCount(zombieKey).value;
      this.zombieLossCount(zombieKey).value = currentLosses + Uint64(1);
    }

    this.updateLastActive(Txn.sender);

    return true;
  }

  /**
   * Change zombie name
   */
  public renameZombie(zombieIndex: uint64, newName: bytes): boolean {
    ensureBudget(5000);

    this.assertUserRegistered(Txn.sender);

    const userKey: bytes = this.getUserKey(Txn.sender);
    const zombieCount: uint64 = this.userZombieCount(userKey).value;

    assert(zombieIndex < zombieCount, "Invalid zombie index");
    assert(newName.length > 0, "Name cannot be empty");
    assert(newName.length <= 32, "Name too long (max 32 bytes)");

    const zombieKey: bytes = this.getZombieKey(Txn.sender, zombieIndex);
    this.zombieName(zombieKey).value = newName;

    this.updateLastActive(Txn.sender);

    return true;
  }

  // ============ Read-Only Methods ============

  /**
   * Get user statistics
   */
  public getUserStats(user: Account): [uint64, uint64, uint64, uint64, uint64, uint64] {
    const userKey: bytes = this.getUserKey(user);

    if (!this.userRegistered(userKey).exists || this.userRegistered(userKey).value === Uint64(0)) {
      return [Uint64(0), Uint64(0), Uint64(0), Uint64(0), Uint64(0), Uint64(0)];
    }

    return [
      this.userZombieCount(userKey).value,
      this.userCurrentLesson(userKey).value,
      this.userTotalScore(userKey).value,
      this.userTotalRewards(userKey).value,
      this.userLastActive(userKey).value,
      this.userRewardCount(userKey).value,
    ];
  }

  /**
   * Get zombie details
   */
  public getZombie(user: Account, zombieIndex: uint64): [bytes, uint64, uint64, uint64, uint64, uint64] {
    const zombieKey: bytes = this.getZombieKey(user, zombieIndex);

    assert(this.zombieName(zombieKey).exists, "Zombie does not exist");

    return [
      this.zombieName(zombieKey).value,
      this.zombieLevel(zombieKey).value,
      this.zombieDna(zombieKey).value,
      this.zombieWinCount(zombieKey).value,
      this.zombieLossCount(zombieKey).value,
      this.zombieCreatedAt(zombieKey).value,
    ];
  }

  /**
   * Check if lesson is completed
   */
  public isLessonCompleted(user: Account, lessonId: uint64): boolean {
    const lessonKey: bytes = this.getLessonKey(user, lessonId);

    if (!this.lessonCompleted(lessonKey).exists) {
      return false;
    }

    return this.lessonCompleted(lessonKey).value === Uint64(1);
  }

  /**
   * Get contract statistics
   */
  public getContractStats(): [uint64, uint64, uint64, uint64] {
    return [this.totalUsers.value, this.totalZombies.value, this.totalLessons.value, this.rewardPerLesson.value];
  }

  /**
   * Check if user is registered
   */
  public isUserRegistered(user: Account): boolean {
    const userKey: bytes = this.getUserKey(user);

    if (!this.userRegistered(userKey).exists) {
      return false;
    }

    return this.userRegistered(userKey).value === Uint64(1);
  }

  // ============ Admin Functions ============

  /**
   * Update reward per lesson (owner only)
   */
  public updateRewardPerLesson(newReward: uint64): boolean {
    assert(Txn.sender === this.contractOwner.value, "Only owner can update");
    assert(newReward > Uint64(0), "Reward must be positive");

    this.rewardPerLesson.value = newReward;

    return true;
  }

  /**
   * Update total lessons (owner only)
   */
  public updateTotalLessons(newTotal: uint64): boolean {
    assert(Txn.sender === this.contractOwner.value, "Only owner can update");
    assert(newTotal >= this.totalLessons.value, "Cannot reduce lessons");

    this.totalLessons.value = newTotal;

    return true;
  }

  /**
   * Fund contract - owner can send ALGO for rewards
   */
  public fundContract(): boolean {
    assert(Txn.sender === this.contractOwner.value, "Only owner can fund");
    // This method accepts payment transactions
    return true;
  }

  /**
   * Emergency withdraw (owner only)
   */
  public emergencyWithdraw(amount: uint64): boolean {
    assert(Txn.sender === this.contractOwner.value, "Only owner");

    itxn
      .payment({
        receiver: this.contractOwner.value,
        amount: amount,
        fee: Uint64(0),
      })
      .submit();

    return true;
  }
}
