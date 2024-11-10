import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { socketClient } from "../utils/Socket"
import Lottie from "lottie-react"
import animationData from "../assets/loader2.json"

const Headerquery = () => {
    const { Jwtbyuser } = useParams()
    const navigate = useNavigate()
    const [errorMessage, setErrorMessage] = useState("")

    const fetchMeetingDetails = async () => {
        try {
            const result = await fetch("http://localhost:8080/meeting/link", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ meet_token: Jwtbyuser }),
            })

            if (!result.ok) {
                throw new Error("The room link does not exist")
            }

            const data = await result.json()

            if (data.msg.valid && data.msg.admin && data.msg.id) {
                socketClient.connect()
                console.log("admin in")

                socketClient.emit(
                    "create-room",
                    { id: data.msg.id },
                    (response) => {
                        if (response.success) {
                            navigate("/Canvas")
                        }
                    }
                )
            } else if (
                data.msg.valid &&
                !data.msg.admin &&
                data.msg.id &&
                data.msg.adminIn
            ) {
                navigate("/", { state: { meet_token: data.msg.id } })
            } else if (
                data.msg.valid &&
                !data.msg.admin &&
                data.msg.id &&
                !data.msg.adminIn
            ) {
                setErrorMessage("Wait for Admin to Join")
            } else {
                setErrorMessage("This is not a valid link.")
            }
        } catch (error) {
            setErrorMessage("An error occurred while fetching meeting details.")
        }
    }

    useEffect(() => {
        fetchMeetingDetails()
    }, [])

    return (
        <div className="headerquery-container">
            <Lottie
                animationData={animationData}
                loop={true}
                className="lottie-animation"
            />
            {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>
    )
}

export default Headerquery
