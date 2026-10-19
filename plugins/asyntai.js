async function asyntai(message, sessionId = null) {
    let currentSessionId = null;
    
    function generateSessionId() {
        return 'session_' + Math.random().toString(36).substr(2, 12);
    }

    if (!sessionId && !currentSessionId) {
        currentSessionId = generateSessionId();
    }

    const requestData = {
        widget_id: "asyntai_2bcd9dfbae24",
        message: message,
        session_id: sessionId || currentSessionId
    };

    const response = await fetch("https://asyntai.com/api/widget-chat/", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.session_id) {
        currentSessionId = data.session_id;
    }
    
    return {
        reply: data.reply,
        session_id: currentSessionId
    };
}

export default {
    meta: {
        id: 'asyntai-chat',
        name: 'Asynt AI Chat',
        path: '/api/ai/asyntai',
        method: 'GET',
        category: 'AI',
        desc: 'Chat dengan Asynt AI.',
        params: [
            { key: 'prompt', label: 'Pertanyaan / Prompt', placeholder: 'Halo, siapa kamu?', type: 'text' },
            { key: 'session', label: 'Session ID (Opsional)', placeholder: 'session_xxxxxx', type: 'text' }
        ]
    },
    handler: async (req, res) => {
        const { prompt, session } = req.query;
        
        if (!prompt) {
            return res.status(400).json({ creator: "API KENNX", success: false, error: 'Parameter "prompt" wajib diisi!' });
        }

        try {
            const responseData = await asyntai(prompt, session || null);

            res.json({
                creator: "API KENNX",
                success: true,
                data: {
                    input: prompt,
                    result: responseData
                }
            });

        } catch (error) {
            res.status(500).json({ 
                creator: "API KENNX", 
                success: false, 
                error: error.message 
            });
        }
    }
};