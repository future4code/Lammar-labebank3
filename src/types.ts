
export type UserAccount = {
    name: string, 
    cpf: string, 
    birthDate: string,
    balance: number,
    statement: UserBankStatement[]
}

export type UserBankStatement = {
    value: number,
    date: string,
    description: string
}

