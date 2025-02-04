// // let localStream
// let remoteStream
let servers = {
    iceServers: [
        {
            urls: [
                "stun:stun1.l.google.com:19302",
                "stun:stun2.l.google.com:19302",
            ],
        },
    ],
}
/**
 * gets the user media
 * @param {boolean} isVideo
 * @param {boolean} isAudio
 * @returns usermedia
 */
export const init = async (isVideo, isAudio) => {
    let localStream = await navigator.mediaDevices.getUserMedia({
        video: isVideo,
        audio: isAudio,
    })

    return localStream
}
/**
 * creates RTC-PeerConnection
 * @returns {Array} remoteStream, localDesc
 */
export const createPeerConnection = async () => {
    let localStream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true,
    })

    let peerConnection = new RTCPeerConnection(servers)

    let remoteStream = new MediaStream()

    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream)
    })

    peerConnection.ontrack = async (event) => {
        event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track)
        })
    }

    let localDesc
    peerConnection.onicecandidate = async (event) => {
        console.log(event.candidate)

        if (event.candidate) {
            localDesc = JSON.stringify(peerConnection.localDescription)
        } else localDesc = undefined
    }
    return [remoteStream, localDesc, peerConnection]
}
export const createOffer = async () => {
    let [remoteStream, localDesc, peerConnection] = await createPeerConnection()

    let offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)

    return JSON.stringify(offer)
}
export const createAnswer = async (offer) => {
    let [remoteStream, localDesc, peerConnection] = createPeerConnection()

    if (!offer) return alert("need offer from peer first..")

    offer = JSON.parse(offer)
    await peerConnection.setRemoteDescription(offer)

    let answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)

    if (!answer) return alert("retrieve answer from peer")

    answer = JSON.parse(answer)

    if (!peerConnection.currentRemoteDescription) {
        await peerConnection.setRemoteDescription(answer)
    }
    return [remoteStream, localDesc, ls]
}
