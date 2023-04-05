import { useWeb3Contract } from "react-moralis"
import { contractAddresses, abi } from "../constants/index"
import { useMoralis } from "react-moralis"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useNotification } from "web3uikit"

export default function LotteryEntrance() {
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
    //chainId: chainIdHex means we are pulling out chainId object from moralis and renaming it to chainIdHex
    const chainId = parseInt(chainIdHex)
    console.log(parseInt(chainIdHex))
    const raffleAddress =
        chainId in contractAddresses
            ? contractAddresses[chainId][0 /*chainId at position 0 */]
            : null

    //using useState
    //entranceFee is the varible to call entranceFee
    //setEntranceFee is gonna be the function we use to set or update the entranceFee which triggers the re-render
    const [entranceFee, setEntranceFee] = useState("0")

    const [numPlayers, setNumPlayers] = useState("0")

    const [recentWinner, setRecentWinner] = useState("0")

    //notification provider gives us a dispatch in the form of pop up
    const dispatch = useNotification()

    //runContractFunction can both send transactions and read state
    const { runContractFunction: enterRaffle } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        params: {},
        msgValue: entranceFee,
    })

    //to store these values and update in our frontend we create useState consts for them
    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getEntranceFee",
        params: {},
    })

    const { runContractFunction: getNumPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getNumPlayers",
        params: {},
    })

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params: {},
    })

    async function updateUI() {
        const entranceFeeFromCall = (await getEntranceFee()).toString()
        const numPlayersFromCall = (await getNumPlayers()).toString()
        const recentWinnerFromCall = await getRecentWinner()
        setEntranceFee(entranceFeeFromCall)
        setNumPlayers(numPlayersFromCall)
        setRecentWinner(recentWinnerFromCall)
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            //try to read the raffle entrance fee
            updateUI()
        }
    }, [isWeb3Enabled])

    const handleSuccess = async function (tx) {
        await tx.wait(1)
        handleNewNotification(tx)
        updateUI()
    }

    const handleNewNotification = function () {
        dispatch({
            type: "info",
            message: "Transaction Complete",
            title: "Tx notification",
            position: "topR",
            icon: "Bell",
        })
    }

    return (
        <div className="p-5">
            Hi from LotteryEntrance
            {raffleAddress ? (
                <div>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                        onClick={async function () {
                            await enterRaffle({
                                //onSuccess checks if the transaction was successfully sent to metamask
                                onSuccess: handleSuccess,
                                onError: (error) => console.log(error),
                            })
                        }}
                    >
                        Enter Raffle
                    </button>
                    Entrance Fee:{ethers.utils.formatUnits(entranceFee, "ether")} ETH <br />
                    Number of Players: {numPlayers} <br />
                    Recent Winner: {recentWinner}
                </div>
            ) : (
                <div>No raffle address detected!</div>
            )}
        </div>
    )
}
