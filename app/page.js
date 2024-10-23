'use client'
import {Box, Stack, TextField, Button} from '@mui/material'
import Image from "next/image";
import {useState} from 'react'

export default function Home() {
  const [messages, setMessages] = useState(
    [
      {
      role: 'assistant',
      content: `Hello, I'm the CareerPath Support Agent, how may I assist you today?`
      }
    ]
  )

  const [message, setMessage] = useState('')

  const sendMessage = async()=>{
    setMessage('')
    setMessages((messages)=>[
      ...messages,
      {role: "user", content: message},
      {role: "assistant", content:""}
    ])
    const response = fetch('/api/chat', {
      method: "POST",
      headers:{
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([...messages, {role: 'user', content: message}]),
    }).then(async (res)=>{
      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      let result = ''
      return reader.read().then(function processText({done, value}){
        if (done){
          return result
        }
        const text = decoder.decode(value || new Int8Array(), {stream:true})
        setMessages((messages)=>{
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)
          return([
            ...otherMessages,
            {
              ...lastMessage,
              content: lastMessage.content + text, 
            },
          ])
        })
        return reader.read().then(processText)
      })
    })
  }
  
  return (
    <Box 
      width="100vw"
      height="100vw"
      bgcolor={"#141414"}
    >
      <Box
      width="auto"
      height="auto"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      padding="100px"
      maxWidth="600px"
      margin="0 auto"
      >
      <Stack
        direction = "column"
        width = "600px"
        height="700px"
        border="1px solid white"
        p={2}
        spacing={3}>
          <Stack 
            direction="column" 
            spacing={2} 
            flexGrow={1} 
            overflow="auto" 
            maxHeight="100%"
          >
            {
              messages.map((message, index)=>(
                <Box key = {index} display = 'flex' justifyContent={
                  message.role=== 'assistant' ? 'flex-start' : 'flex-end'
                  }
                >
                  <Box bgcolor={
                    message.role === 'assistant' ? 'primary.main' : 'secondary.main'
                    }
                  color="white"
                  borderRadius={16}
                  p={3}
                  >
                    {message.content}
                  </Box>
                </Box>
              ))}
          </Stack>
          <Stack direction="row" spacing = {2}>
            <TextField
              label = "message"
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white', // text color
                  '& fieldset': {
                    borderColor: 'white', // border color
                  },
                  '&:hover fieldset': {
                    borderColor: 'white', // border color when hovered
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'white', // border color when focused
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#D3D3D3', // label text color
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#D3D3D3', // label text color when focused
                },
              }}
            />
            <Button variant="contained" onClick={sendMessage}>Send</Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  )
}
