 // Voice Recognition and Text-to-Speech Implementation
 document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const listenBtn = document.getElementById('listenBtn');
    const readBtn = document.getElementById('readBtn');
    const helpBtn = document.getElementById('helpBtn');
    const startVoiceBtn = document.getElementById('startVoiceBtn');
    const fillAllBtn = document.getElementById('fillAllBtn');
    const voiceFeedback = document.getElementById('voiceFeedback');
    const feedbackText = document.getElementById('feedbackText');
    const transcriptText = document.getElementById('transcriptText');
    const statusIndicator = document.getElementById('statusIndicator');
    const commandHelper = document.getElementById('commandHelper');
    const closeHelper = document.getElementById('closeHelper');
    const voiceFieldBtns = document.querySelectorAll('.voice-field-btn');
    const contactForm = document.getElementById('contactForm');
    
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const speechSynthesis = window.speechSynthesis;
    
    if (!SpeechRecognition || !speechSynthesis) {
        alert('Your browser does not support all the required speech features. Please try Chrome or Edge.');
        listenBtn.disabled = true;
        readBtn.disabled = true;
        startVoiceBtn.disabled = true;
        fillAllBtn.disabled = true;
        voiceFieldBtns.forEach(btn => btn.disabled = true);
    }
    
    // Initialize speech recognition
    let recognition;
    let isListening = false;
    let currentField = null;
    let fillAllMode = false;
    let confirmationMode = false;
    let lastCommand = '';
    
    // Available commands for help
    const availableCommands = {
        navigation: [
            "Go to [section] - Navigate to different sections (home, features, form, about)",
            "Scroll up/down - Move the page up or down",
            "Go back - Return to the previous page"
        ],
        form: [
            "Fill form - Start form filling mode",
            "My name is [name] - Set your name",
            "My email is [email] - Set your email",
            "My phone is [number] - Set your phone number",
            "Subject is [subject] - Set the subject",
            "Message is [text] - Set your message",
            "My date of birth is [date] - Set date of birth",
            "My address is [address] - Set your address",
            "Gender is [male/female/other] - Set gender",
            "Submit form - Submit the completed form",
            "Reset form - Clear all form fields"
        ],
        control: [
            "Start listening - Activate voice control",
            "Stop listening - Deactivate voice control",
            "Read content - Read the current page content",
            "Read instructions - Hear how to use this system",
            "Show commands - Display available commands",
            "Confirm - Confirm the previous action",
            "Cancel - Cancel the current operation"
        ],
        settings: [
            "Faster speech - Increase speech rate",
            "Slower speech - Decrease speech rate",
            "Higher pitch - Increase voice pitch",
            "Lower pitch - Decrease voice pitch",
            "Change voice - Switch to a different voice"
        ]
    };
    
    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        recognition.onstart = function() {
            isListening = true;
            listenBtn.classList.add('active');
            voiceFeedback.classList.add('active');
            statusIndicator.classList.add('listening');
            feedbackText.textContent = 'Listening...';
            transcriptText.textContent = '';
        };
        
        recognition.onerror = function(event) {
            console.error('Speech recognition error', event.error);
            feedbackText.textContent = 'Error: ' + event.error;
            statusIndicator.classList.remove('listening');
            speak("Sorry, I encountered an error. Please try again.");
        };
        
        recognition.onend = function() {
            isListening = false;
            listenBtn.classList.remove('active');
            statusIndicator.classList.remove('listening');
            if (feedbackText.textContent === 'Listening...') {
                feedbackText.textContent = 'Microphone disconnected';
            }
        };
        
        recognition.onresult = function(event) {
            let interimTranscript = '';
            let finalTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }
            
            transcriptText.textContent = interimTranscript || finalTranscript;
            
            if (finalTranscript) {
                processVoiceCommand(finalTranscript);
            }
        };
    }
    
    // Process voice commands
    function processVoiceCommand(command) {
        command = command.toLowerCase().trim();
        feedbackText.textContent = 'Processing: ' + command;
        
        // Handle confirmation/cancellation first
        if (confirmationMode) {
            if (command.includes('confirm') || command.includes('yes')) {
                confirmationMode = false;
                if (lastCommand.includes('submit form')) {
                    contactForm.submit();
                    speak('Form submitted successfully. Thank you!');
                } else if (lastCommand.includes('reset form')) {
                    contactForm.reset();
                    speak('Form has been reset.');
                }
            } else if (command.includes('cancel') || command.includes('no')) {
                confirmationMode = false;
                speak('Action cancelled.');
            }
            return;
        }
        
        // Navigation commands
        if (command.includes('go to home') || command.includes('home')) {
            window.location.href = '#home';
            speak('Navigating to home section');
        } else if (command.includes('go to features') || command.includes('features')) {
            window.location.href = '#features';
            speak('Navigating to features section');
        } else if (command.includes('go to form') || command.includes('form')) {
            window.location.href = '#form';
            speak('Navigating to contact form');
        } else if (command.includes('go to about') || command.includes('about')) {
            window.location.href = '#about';
            speak('Navigating to about section');
        } else if (command.includes('go back')) {
            window.history.back();
            speak('Going back to previous page');
        } 
        // Scrolling commands
        else if (command.includes('scroll up') || command.includes('move up')) {
            window.scrollBy(0, -200);
            speak('Scrolling up');
        } else if (command.includes('scroll down') || command.includes('move down')) {
            window.scrollBy(0, 200);
            speak('Scrolling down');
        } else if (command.includes('scroll to top')) {
            window.scrollTo(0, 0);
            speak('Scrolling to top of page');
        } else if (command.includes('scroll to bottom')) {
            window.scrollTo(0, document.body.scrollHeight);
            speak('Scrolling to bottom of page');
        } 
        // Reading commands
        else if (command.includes('read content') || command.includes('read page')) {
            readPageContent();
        } else if (command.includes('read instructions')) {
            readInstructions();
        } else if (command.includes('read form')) {
            readFormContent();
        } 
        // Form filling commands
        else if (command.includes('fill form') || command.includes('complete form')) {
            speak('Please speak your information for the form. You can say things like "my name is John", "my email is john@example.com", etc.');
            fillAllMode = true;
        } else if (command.includes('my name is')) {
            const name = command.replace('my name is', '').trim();
            document.getElementById('name').value = name;
            speak(`Name set to ${name}`);
        } else if (command.includes('my email is')) {
            const email = command.replace('my email is', '').trim();
            document.getElementById('email').value = email;
            speak(`Email set to ${email}`);
        } else if (command.includes('my phone is') || command.includes('my number is')) {
            const phone = command.replace(/my (phone|number) is/, '').trim();
            document.getElementById('phone').value = phone;
            speak(`Phone number set to ${phone}`);
        } else if (command.includes('subject is')) {
            const subject = command.replace('subject is', '').trim();
            const select = document.getElementById('subject');
            for (let i = 0; i < select.options.length; i++) {
                if (select.options[i].text.toLowerCase().includes(subject)) {
                    select.value = select.options[i].value;
                    speak(`Subject set to ${select.options[i].text}`);
                    break;
                }
            }
        } else if (command.includes('message is')) {
            const message = command.replace('message is', '').trim();
            document.getElementById('message').value = message;
            speak('Message received');
        } else if (command.includes('my date of birth is') || command.includes('my dob is')) {
            const dob = command.replace(/my (date of birth|dob) is/, '').trim();
            document.getElementById('dob').value = dob;
            speak(`Date of birth set to ${dob}`);
        } else if (command.includes('my address is')) {
            const address = command.replace('my address is', '').trim();
            document.getElementById('address').value = address;
            speak(`Address set to ${address}`);
        } else if (command.includes('gender is')) {
            const gender = command.replace('gender is', '').trim();
            const radios = document.getElementsByName('gender');
            for (let radio of radios) {
                if (radio.value.toLowerCase().includes(gender)) {
                    radio.checked = true;
                    speak(`Gender set to ${radio.value}`);
                    break;
                }
            }
        } else if (command.includes('marital status is')) {
            const status = command.replace('marital status is', '').trim();
            const select = document.getElementById('maritalStatus');
            for (let i = 0; i < select.options.length; i++) {
                if (select.options[i].text.toLowerCase().includes(status)) {
                    select.value = select.options[i].value;
                    speak(`Marital status set to ${select.options[i].text}`);
                    break;
                }
            }
        } else if (command.includes('i agree to terms') || command.includes('accept terms')) {
            document.getElementById('terms').checked = true;
            speak('Terms and conditions accepted');
        } else if (command.includes('i do not agree to terms') || command.includes('decline terms')) {
            document.getElementById('terms').checked = false;
            speak('Terms and conditions declined');
        } else if (command.includes('submit form')) {
            lastCommand = command;
            confirmationMode = true;
            speak('Are you sure you want to submit the form? Say confirm to submit or cancel to go back.');
        } else if (command.includes('reset form') || command.includes('clear form')) {
            lastCommand = command;
            confirmationMode = true;
            speak('Are you sure you want to reset the form? All entered data will be lost. Say confirm to reset or cancel to go back.');
        } 
        // Control commands
        else if (command.includes('start listening') || command.includes('start voice')) {
            startListening();
            speak('Voice control activated. How can I help you?');
        } else if (command.includes('stop listening') || command.includes('turn off') || command.includes('end voice')) {
            stopListening();
            speak('Voice control deactivated');
        } else if (command.includes('show commands') || command.includes('help') || command.includes('what can i say')) {
            showCommandHelper();
            speak('Displaying available commands. Here are some things you can say:');
        } 
        // Settings commands
        else if (command.includes('faster speech') || command.includes('speak faster')) {
            adjustSpeechRate(0.2);
            speak('I will speak faster now');
        } else if (command.includes('slower speech') || command.includes('speak slower')) {
            adjustSpeechRate(-0.2);
            speak('I will speak slower now');
        } else if (command.includes('higher pitch') || command.includes('higher voice')) {
            adjustPitch(0.2);
            speak('Adjusting voice pitch higher');
        } else if (command.includes('lower pitch') || command.includes('lower voice')) {
            adjustPitch(-0.2);
            speak('Adjusting voice pitch lower');
        } else if (command.includes('change voice')) {
            changeVoice();
            speak('Changing voice');
        }
        // Field-specific commands (when a field is focused)
        else if (currentField) {
            document.getElementById(currentField).value = command;
            speak(`${currentField.replace('-', ' ')} updated to ${command}`);
            currentField = null;
        } 
        // Fill all mode processing
        else if (fillAllMode) {
            if (command.includes('name')) {
                const name = command.replace('name', '').trim();
                document.getElementById('name').value = name;
                speak(`Name set to ${name}`);
            } else if (command.includes('email')) {
                const email = command.replace('email', '').trim();
                document.getElementById('email').value = email;
                speak(`Email set to ${email}`);
            } else if (command.includes('phone') || command.includes('number')) {
                const phone = command.replace(/phone|number/, '').trim();
                document.getElementById('phone').value = phone;
                speak(`Phone number set to ${phone}`);
            } else if (command.includes('subject')) {
                const subject = command.replace('subject', '').trim();
                const select = document.getElementById('subject');
                for (let i = 0; i < select.options.length; i++) {
                    if (select.options[i].text.toLowerCase().includes(subject)) {
                        select.value = select.options[i].value;
                        speak(`Subject set to ${select.options[i].text}`);
                        break;
                    }
                }
            } else if (command.includes('message')) {
                const message = command.replace('message', '').trim();
                document.getElementById('message').value = message;
                speak('Message received');
            } else if (command.includes('date of birth') || command.includes('dob')) {
                const dob = command.replace(/date of birth|dob/, '').trim();
                document.getElementById('dob').value = dob;
                speak(`Date of birth set to ${dob}`);
            } else if (command.includes('address')) {
                const address = command.replace('address', '').trim();
                document.getElementById('address').value = address;
                speak(`Address set to ${address}`);
            } else if (command.includes('gender')) {
                const gender = command.replace('gender', '').trim();
                const radios = document.getElementsByName('gender');
                for (let radio of radios) {
                    if (radio.value.toLowerCase().includes(gender)) {
                        radio.checked = true;
                        speak(`Gender set to ${radio.value}`);
                        break;
                    }
                }
            } else if (command.includes('marital status')) {
                const status = command.replace('marital status', '').trim();
                const select = document.getElementById('maritalStatus');
                for (let i = 0; i < select.options.length; i++) {
                    if (select.options[i].text.toLowerCase().includes(status)) {
                        select.value = select.options[i].value;
                        speak(`Marital status set to ${select.options[i].text}`);
                        break;
                    }
                }
            } else if (command.includes('terms') || command.includes('conditions')) {
                if (command.includes('agree') || command.includes('accept')) {
                    document.getElementById('terms').checked = true;
                    speak('Terms and conditions accepted');
                } else if (command.includes('disagree') || command.includes('decline')) {
                    document.getElementById('terms').checked = false;
                    speak('Terms and conditions declined');
                }
            }
            
            // Check if all required fields are filled
            if (checkFormCompletion()) {
                fillAllMode = false;
                speak('Form completed. You can say "submit form" to send it or "read form" to review your information.');
            }
        }
        // Default response for unrecognized commands
        else {
            speak("I didn't understand that. Please try again or say 'help' for a list of commands.");
        }
    }
    
    // Check if form is completed
    function checkFormCompletion() {
        const requiredFields = ['name', 'email', 'subject', 'message', 'terms'];
        for (let field of requiredFields) {
            const element = document.getElementById(field);
            if (element.type === 'checkbox') {
                if (!element.checked) return false;
            } else {
                if (!element.value.trim()) return false;
            }
        }
        return true;
    }
    
    // Text-to-speech function with settings
    let speechSettings = {
        rate: 1.0,
        pitch: 1.0,
        voice: null
    };
    
    function speak(text, settings = {}) {
        if (speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = settings.rate || speechSettings.rate;
            utterance.pitch = settings.pitch || speechSettings.pitch;
            
            if (settings.voice || speechSettings.voice) {
                utterance.voice = settings.voice || speechSettings.voice;
            }
            
            speechSynthesis.speak(utterance);
        }
    }
    
    // Adjust speech rate
    function adjustSpeechRate(change) {
        speechSettings.rate = Math.max(0.5, Math.min(2.0, speechSettings.rate + change));
    }
    
    // Adjust pitch
    function adjustPitch(change) {
        speechSettings.pitch = Math.max(0.5, Math.min(2.0, speechSettings.pitch + change));
    }
    
    // Change voice
    function changeVoice() {
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
            // Filter for English voices
            const englishVoices = voices.filter(voice => voice.lang.includes('en'));
            if (englishVoices.length > 0) {
                // Get current voice index
                let currentIndex = 0;
                if (speechSettings.voice) {
                    currentIndex = englishVoices.findIndex(voice => voice.name === speechSettings.voice.name);
                }
                
                // Select next voice
                const nextIndex = (currentIndex + 1) % englishVoices.length;
                speechSettings.voice = englishVoices[nextIndex];
                speak(`Voice changed to ${speechSettings.voice.name}`, { voice: speechSettings.voice });
            }
        }
    }
    
    // Read page content
    function readPageContent() {
        if (speechSynthesis) {
            // Get all text content from main sections
            const sections = document.querySelectorAll('header, section, footer');
            let allText = '';
            
            sections.forEach(section => {
                // Skip elements that are hidden or shouldn't be read
                if (section.offsetParent !== null && !section.classList.contains('voice-feedback')) {
                    // Skip navigation menus and buttons
                    if (!section.classList.contains('nav') && !section.classList.contains('button-container')) {
                        allText += section.textContent + '\n';
                    }
                }
            });
            
            // Clean up the text
            allText = allText.replace(/\s+/g, ' ').trim();
            
            if (allText) {
                const utterance = new SpeechSynthesisUtterance(allText);
                utterance.rate = 0.9;
                speak('Reading page content');
                speechSynthesis.speak(utterance);
            }
        }
    }
    
    // Read form content
    function readFormContent() {
        if (speechSynthesis) {
            let formText = 'Form information: ';
            
            // Read all form fields
            const fields = [
                { id: 'name', label: 'Name' },
                { id: 'email', label: 'Email' },
                { id: 'phone', label: 'Phone number' },
                { id: 'subject', label: 'Subject' },
                { id: 'message', label: 'Message' },
                { id: 'dob', label: 'Date of birth' },
                { id: 'address', label: 'Address' },
                { name: 'gender', label: 'Gender' },
                { id: 'maritalStatus', label: 'Marital status' },
                { id: 'terms', label: 'Terms accepted' }
            ];
            
            fields.forEach(field => {
                let value = '';
                if (field.id) {
                    const element = document.getElementById(field.id);
                    if (element) {
                        if (element.type === 'checkbox') {
                            value = element.checked ? 'yes' : 'no';
                        } else {
                            value = element.value || 'not provided';
                        }
                    }
                } else if (field.name) {
                    const selected = document.querySelector(`input[name="${field.name}"]:checked`);
                    value = selected ? selected.value : 'not specified';
                }
                
                formText += `${field.label}: ${value}. `;
            });
            
            speak(formText);
        }
    }
    
    // Read instructions
    function readInstructions() {
        const instructions = `Welcome to VoiceFirst. You can control this website using your voice. 
            To navigate, say commands like "go to home" or "scroll down". 
            To fill the form, say "fill form" then provide your information like "my name is John". 
            You can say "show commands" at any time to see what commands are available. 
            Say "stop listening" when you're done. How can I help you today?`;
        speak(instructions);
    }
    
    // Start/stop listening
    function startListening() {
        if (recognition && !isListening) {
            try {
                recognition.start();
            } catch (e) {
                console.error('Recognition start error:', e);
                feedbackText.textContent = 'Error starting microphone';
                speak("I'm having trouble accessing the microphone. Please check your permissions.");
            }
        }
    }
    
    function stopListening() {
        if (recognition && isListening) {
            recognition.stop();
            fillAllMode = false;
            currentField = null;
            confirmationMode = false;
        }
    }
    
    // Toggle command helper
    function showCommandHelper() {
        // Populate command helper content
        let helperContent = '';
        for (const [category, commands] of Object.entries(availableCommands)) {
            helperContent += `<h3>${category.charAt(0).toUpperCase() + category.slice(1)} Commands</h3><ul>`;
            commands.forEach(cmd => {
                helperContent += `<li>${cmd}</li>`;
            });
            helperContent += '</ul>';
        }
        document.getElementById('helperContent').innerHTML = helperContent;
        commandHelper.classList.add('active');
    }
    
    function hideCommandHelper() {
        commandHelper.classList.remove('active');
    }
    
    // Event listeners
    listenBtn.addEventListener('click', function() {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    });
    
    readBtn.addEventListener('click', function() {
        readPageContent();
    });
    
    helpBtn.addEventListener('click', showCommandHelper);
    closeHelper.addEventListener('click', hideCommandHelper);
    
    startVoiceBtn.addEventListener('click', function() {
        startListening();
        readInstructions();
    });
    
    fillAllBtn.addEventListener('click', function() {
        fillAllMode = true;
        startListening();
        speak('Please speak your information for the form. You can say things like "my name is John", "my email is john@example.com", etc. I will guide you through each field.');
    });
    
    // Field-specific voice buttons
    voiceFieldBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const fieldId = this.getAttribute('data-field');
            currentField = fieldId;
            startListening();
            speak(`Please speak the value for ${fieldId.replace('-', ' ')}`);
        });
    });
    
    // Form submission
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        // In a real application, you would submit the form to a server here
        speak('Form submitted successfully. Thank you for your information!');
        this.reset();
    });
    
    // Load voices when they become available
    speechSynthesis.onvoiceschanged = function() {
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0 && !speechSettings.voice) {
            // Default to the first English voice
            const englishVoice = voices.find(voice => voice.lang.includes('en'));
            if (englishVoice) {
                speechSettings.voice = englishVoice;
            }
        }
    };
    
    // Welcome message
    setTimeout(() => {
        speak('Welcome to VoiceFirst, a voice-enabled website experience. Click the microphone button or say "start voice experience" to begin.');
    }, 1000);
});