import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import io from 'socket.io-client';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const socket = io.connect('http://localhost:3001');

const App = () => {

    const [name, setName] = useState('Anonymous');
    const [messages, _setMessages] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [query, setQuery] = useState('');
    const [gifOptions, setGifOptions] = useState([]);
    const [selection, setSelection] = useState(null);

    useEffect(() => {
        async function getGifs() {
            try {
                const key = process.env.REACT_APP_API_KEY;
                const response = await fetch(
                    `https://api.giphy.com/v1/gifs/search?api_key=${key}&q=${query}&limit=10&offset=0&rating=PG-13&lang=en`
                );
                const responseJson = await response.json();
                setGifOptions(responseJson.data.map(e => {
                        return e.images.preview.mp4;
                    })
                );

            } catch (e) {
                console.error(e);
            }
        }
        if (query !== '') {
            getGifs();
        }
    }, [query]);

    const setMessages = (toSet) => {
        if (toSet.length > 100) {
            _setMessages(toSet.slice(toSet.length - 15, toSet.length));
        } else {
            _setMessages(toSet);
        }
    }

    socket.on('message', (message) => {
        const toSet = [...messages, message];
        setMessages(toSet);
    });

    const sendMessage = (e) => {
        if (selection) {
            const message = {
                body: selection.src,
                sender: socket.id,
                name: name
            };
            socket.emit('message', message);
            setMessages([...messages, message]);
        }
        setSearchTerm('');
        setQuery('');
        setSelection(null);
        setGifOptions([]);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        setQuery(searchTerm);
    }

    const handleClick = (e) => {
        if (selection) selection.style.outline = "none";
        e.target.style.outline = "solid blue 3px";
        setSelection(e.target);
    }

    return (
    <div className='App'>

        <div className='Messages'>
            {messages.slice(0).reverse().map((message, i) =>
            <div className='Message' key={messages.length - i - 1} style={{backgroundColor: (message.sender === socket.id) ? 'skyblue' : 'lightgreen'}}>
                {message.name + ": "}
                <video autoPlay loop height="150" width="auto"
                    key={message.body} src={message.body} />
           </div>
            )}
        </div>

        <div className='Gifs'>
            {gifOptions.map(item => <video autoPlay loop height="150"
                width="auto" key={item} src={item} onClick={handleClick} />)}
        </div>

        <Form onSubmit={handleSubmit} className="InputBox">
            <Row>
                <Col md='1' />
                <Col md='2'>
                    <Form.Control type='text'
                        value={name}
                        onChange={(e) => { setName(e.target.value); }}
                        maxLength='20'
                    />
                </Col>
                <Col md='6'>
                    <Form.Control type='text'
                        placeholder='Type your messsage here'
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); }}
                        maxLength='140'
                    />
                </Col>
                <Col md='1'>
                    <Button variant='primary' type='submit'>
                        Search
                    </Button>
                </Col>
                <Col md='1'>
                    <Button variant='primary' onClick={sendMessage}>
                        Send
                    </Button>
                </Col>
                <Col md='1' />
            </Row>
        </Form>
    </div>
  );
}

export default App;
