import { Contract } from '@algorandfoundation/algorand-typescript'

export class ZombiesContract extends Contract {
  hello(name: string): string {
    return `Hello, ${name}`
  }
}
