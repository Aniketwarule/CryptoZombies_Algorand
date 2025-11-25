export interface AlgoClientConfig {
  server: string
  port: string | number
  token: string
  network: string
}

export interface AlgoViteClientConfig extends AlgoClientConfig {}

export interface AlgoViteKMDConfig {
  server: string
  port: string | number
  token: string
  wallet: string
  password: string
}
