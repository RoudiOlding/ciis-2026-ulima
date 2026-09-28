const btnCapturar = document.getElementById('btn-capturar');
const btnProcesar = document.getElementById('btn-procesar');
const textoCapturado = document.getElementById('texto-capturado');
const resultadoDiv = document.getElementById('resultado');

// PASO 1: Extraer el texto de la web al popup
btnCapturar.addEventListener('click', async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => window.getSelection().toString(),
    }, (selection) => {
        const texto = selection[0].result;
        
        if (texto && texto.trim() !== "") {
            textoCapturado.value = texto;
            btnProcesar.disabled = false;
            resultadoDiv.innerText = "¡Texto capturado! Listo para procesar.";
        } else {
            resultadoDiv.innerText = "Por favor, sombrea algo en la página web primero.";
        }
    });
});

// PASO 2: Procesar con IA
btnProcesar.addEventListener('click', async () => {
    const textoAProcesar = textoCapturado.value;
    
    resultadoDiv.innerText = "Procesando texto...";
    btnProcesar.disabled = true;

    // ---------------------------------------------------------
    // TALLER: IMPLEMENTACIÓN
    // ---------------------------------------------------------

    const API_KEY = "…"
    const MODELO = "openai/gpt-oss-safeguard-20b"
    const SYSTEM_PROMPT = "Eres un experto en accesibilidad. Adaptarás el texto recibido bajo pautas de accesibilidad cognitiva y devolverás un solo párrafo como respuesta."

    try {
        const respuesta = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: MODELO,
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: textoAProcesar }
                ]
            })
        });

        const data = await respuesta.json();

        if(!respuesta.ok){
            resultadoDiv.innerText = 'Error de Groq: ${data.error?.message}';
            console.error("Detalle del error:", data);
            btnProcesar.disabled = false;
        }

        // Camino Bueno
        resultadoDiv.innerText = data.choices[0].message.content;
        btnProcesar.disabled = false;
    } catch (error) {
        resultadoDiv.innerText = "Hubo un error.";
        console.error("Error:", error);
        btnProcesar.disabled = false;
    }

});
