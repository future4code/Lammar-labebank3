import express, {Request, Response} from "express"
import { accounts } from "./data"

import cors from 'cors'
import { UserBankStatement } from "./types"

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

//MAKE PAYMENT

app.post("/accounts/:cpf/payment", (req: Request, res: Response) => {
    let errorCode = 400
    try {
        const cpf = req.params.cpf
        const { value, description } = req.body
        let { date } = req.body 

        if(!date) {
            errorCode = 402
            throw new Error("Please, enter a valid date.")
        }

        const [ dd, mm, yyyy ] = date.split('/')
        const paymentDate = new Date (`${dd}-${mm}-${yyyy}`)
        if (!value || !paymentDate || !description) {
            errorCode = 422
            throw new Error("Payment could not be made, please check your details.")
        }
        const accountClient = accounts.findIndex(client => client.cpf === cpf)
        if (accountClient < 0) {
            errorCode = 404
            throw new Error("Client account not found.")
        }


        const client = accounts[accountClient]
        const newTransaction : UserBankStatement = {
            value,
            description,
            date
        }
        if (value > client.balance){
            errorCode = 405
            throw new Error("Insufficient balance.")
        }
        client.statement.push(newTransaction)

        if (newTransaction.value > 0) {
            let purchaseMade = newTransaction.value
            client.balance = client.balance - purchaseMade
            console.log ("Amount paid:",purchaseMade)
            console.log("Balance:",client.balance);
            
        }
        res.status(200).send("Thank you for your payment!")

    } catch (error: any) {
        res.status(errorCode).send(error.message)
    }
})

// TRANSFER

app.put("/banking/transfer", (req: Request, res: Response) => {
    let errorCode = 400
    try {
        const { name, cpf, recipient, cpfRecipient, transferValue } = req.body

        if (!name || !cpf || !recipient || !cpfRecipient || !transferValue) {
            errorCode = 405
            throw new Error("Fill in all information.")
        }

        const fetchUser = accounts.find((clientUser) => {
            return clientUser.name === name && clientUser.cpf === cpf 
        })
        const fetchUserRecipient = accounts.find((clientUserRecipient) => {
            return clientUserRecipient.name === name && clientUserRecipient.cpf === cpf 
        })

        if (!fetchUser) {
            errorCode = 405
            throw new Error("User not found. Please try again.")
        }
        if (!fetchUserRecipient) {
            errorCode = 402
            throw new Error("User recipient not found. Please try again.")
        }

        if (transferValue < 0) {
            errorCode = 403
            throw new Error("Your transfer must be greater than zero.")
        }

        if (transferValue > fetchUser.balance) {
            errorCode = 403
            throw new Error("Sorry, not enough money.")
        }

        const newBalanceUser = fetchUser.balance -= transferValue
        const newBalanceUserRecipient = fetchUserRecipient.balance += transferValue
        
        res.status(200).send(
            `Transfer completed successfully! 
            Saldo do remetente ${name}: ${newBalanceUser}. 
            Saldo do destinatário ${recipient}: ${newBalanceUserRecipient}.`
        )

    } catch (error: any) {
        res.status(errorCode).send(error.message)
    }
})


app.listen(3003, () => {
    console.log("Server is running in http://localhost:3003");
});