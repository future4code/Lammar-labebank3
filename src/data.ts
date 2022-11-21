import * as allTypes from './types'

export let accounts: allTypes.UserAccount[]= [
    {
        name: "Ana Laura", 
        cpf: "001.002.003-04", 
        birthDate: "10/04/1998",
        balance: 3000,
        statement: [{
            value: 500,
            date: "12/11/2022",
            description: "Mercado"
        }]
    },
    {
        name: "Luisa", 
        cpf: "021.452.683-84", 
        birthDate: "21/10/1994",
        balance: 0,
        statement: [{
            value: 200,
            date: "17/08/2022",
            description: "Feira"
        }]
    },
    {
        name: " ", 
        cpf: "234.111.683-66", 
        birthDate: "21/12/2000",
        balance: 10,
        statement: [{
            value: 200,
            date: "17/08/2022",
            description: "Feira"
        }]
    }

]