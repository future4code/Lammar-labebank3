import express, {Request, Response} from "express"
import { accounts } from "./data"

import cors from 'cors'

const app = express()

app.use(express.json())

app.use(cors())

// GET ALL ACCOUNTS 
app.get("/accounts", (req: Request, res: Response) => {
    res.status(200).send(accounts)
})

// CREATE ACCOUNT
app.post("/accounts", (req: Request, res: Response) => {
    let errorCode = 400
    try {
        const {name, cpf, birthDate} = req.body

        if(!name || !cpf || !birthDate) {
            errorCode = 422
            throw new Error ("Necessário inserir todos os parâmetros (name, cpf e birthDate).")
        }

        if (typeof name !== "string" || typeof cpf !== "string" || typeof birthDate!== "string") {
            errorCode = 422
            throw new Error ("Os parâmetros name, cpf e birthDate devem ser do tipo string.")
        }

        if (cpf.length !== 14 || cpf[3] !== "." || cpf[7] !== "." || cpf[11] !== "-" ) {
            errorCode = 422
            throw new Error("O número do cpf deve ser inserido no formato XXX.XXX.XXX-XX");
        }

        if (birthDate.length !== 10 || birthDate[2] !== "/" || birthDate[5] !== "/") {
            errorCode = 422
            throw new Error("A data de aniversário deve ser inserida no formato DD/MM/AAAA");
        }

        function returnAge (birthDate:string): number {
            const today = new Date();
            const date = new Date(birthDate);
            let age = today.getFullYear() - date.getFullYear();
            const m = today.getMonth() - date.getMonth();
            
            if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
                age--;
            }
            
            return age;
        }

        if (returnAge(birthDate) < 18) {
            errorCode = 422
            throw new Error ("O usuário deve ser maior de idade para criar uma conta.")
        }
    
        
        let findCpf = accounts.find(account => {
            return account.cpf === cpf
        })

        if (findCpf) {
            errorCode = 409
            throw new Error("Já existe um conta com esse CPF.");
        }

        const newAccount = {
            name: name,
            cpf: cpf,
            birthDate: birthDate,
            balance: 0,
            statement: []
        }

        accounts.push(newAccount)

        res.status(200).send(accounts)
    } catch (e:any) {
        res.status(errorCode).send(e.message)
    }
})

// GET BALANCE
app.get("/account/balance", (req: Request, res: Response) => {
    let errorCode = 400
  
    try {
        const nome = req.body.name
        const cpf = req.body.cpf

        if(!nome){
            errorCode = 401
            throw new Error("Usuário não cadastrado")
        }
        if(!cpf){
            errorCode = 401
            throw new Error("É necessário informar o CPF de um usuário cadastrado")
        }

        const buscaUsuario = accounts.filter((account)=>{
            if (cpf === account.cpf){
                return account.balance
            }
        })

        const saldo = buscaUsuario.map((saldo)=>{
            return saldo.balance
        })
        
        res.status(200).send(saldo)
        
     } catch (e:any){
        res.status(errorCode).send(e.message)
    }

})

// ADD BALANCE

app.put("/accounts/account", (req: Request, res: Response) => {
    let errorCode = 400

    try {

        const { name, value, cpf } = req.body

        if (!cpf || !name || !value) {
            errorCode = 422
            throw new Error("Passe todos os paramentros");
        }

        if (typeof (name) !== "string") {
            errorCode = 422
            throw new Error("Name inválido");
        }

        if (typeof (cpf) !== "string" || isNaN(Number(cpf)) || cpf.length !== 11 || cpf.includes(" ")) {
            errorCode = 422
            throw new Error("CPF inválido");
        }

        if (typeof (value) !== "number") {
            errorCode = 422
            throw new Error("Valor inválido");
        }

        let check: boolean = false

        for (const account of accounts) {
            if (account.name === name && account.cpf === cpf) {
                check = true
            }
        }
        if (check === false) {
            errorCode = 422
            throw new Error("Please check name and cpf");
        }
        let userBalance = {}
        accounts.map((account) => {
            if (account.name === name && account.cpf === cpf) {
                account.balance = account.balance + value
                 userBalance = {
                    name: account.name,
                    cpf: account.cpf,
                    birthDate: account.birthDate,
                    balance: account.balance
                }
            
            return userBalance
    }})
        
        res.status(200).send(userBalance)
        
    } catch (error: any) {
        res.status(errorCode).send(error.message)
    }
})


app.listen(3003, () => {
    console.log("Server is running in http://localhost:3003");
});