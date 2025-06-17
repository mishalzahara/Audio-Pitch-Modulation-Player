
        // Audio context variables
        let audioContext;
        let sourceNode;
        let audioBuffer;
        let playbackRate = 1.0;
        let intervalId;
        let isHighPitch = false;
        
        // DOM elements
        const audioFileInput = document.getElementById('audioFile');
        const playBtn = document.getElementById('playBtn');
        const stopBtn = document.getElementById('stopBtn');
        const statusDiv = document.getElementById('status');
        const pitchValueSpan = document.getElementById('pitchValue');
        const visualPitchValueSpan = document.getElementById('visualPitchValue');
        const soundWave = document.getElementById('soundWave');
        const pitchIndicator = document.getElementById('pitchIndicator');
        
        // Initialize audio context
        function initAudioContext() {
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
        }
        
        // Load audio file
        audioFileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            statusDiv.textContent = "Loading audio file...";
            playBtn.disabled = true;
            
            const fileReader = new FileReader();
            fileReader.onload = function(e) {
                initAudioContext();
                
                audioContext.decodeAudioData(e.target.result)
                    .then(buffer => {
                        audioBuffer = buffer;
                        statusDiv.textContent = "Audio file loaded and ready to play";
                        playBtn.disabled = false;
                    })
                    .catch(err => {
                        statusDiv.textContent = "Error loading audio file: " + err.message;
                        playBtn.disabled = true;
                    });
            };
            
            fileReader.onerror = function() {
                statusDiv.textContent = "Error reading file";
                playBtn.disabled = true;
            };
            
            fileReader.readAsArrayBuffer(file);
        });
        
        // Update visual elements based on current pitch
        function updateVisuals(pitch) {
            // Update numerical display
            pitchValueSpan.textContent = pitch.toFixed(1);
            visualPitchValueSpan.textContent = pitch.toFixed(1);
            
            // Update wave animation speed
            const waveSpeed = 1 / pitch;
            soundWave.style.animation = `waveAnimation ${waveSpeed}s linear infinite`;
            
            // Update pitch indicator width
            const indicatorWidth = Math.min(100, pitch * 20);
            pitchIndicator.style.width = `${indicatorWidth}%`;
            
            // Change color based on pitch
            if (pitch > 1) {
                soundWave.style.background = `repeating-linear-gradient(
                    to right,
                    transparent,
                    transparent ${15/pitch}px,
                    #e74c3c ${15/pitch}px,
                    #e74c3c ${18/pitch}px
                )`;
                soundWave.style.backgroundSize = `${33/pitch}px 100%`;
            } else {
                soundWave.style.background = `repeating-linear-gradient(
                    to right,
                    transparent,
                    transparent 15px,
                    #3498db 15px,
                    #3498db 18px
                )`;
                soundWave.style.backgroundSize = `33px 100%`;
            }
        }
        
        // Play audio with pitch modulation
        playBtn.addEventListener('click', function() {
            if (!audioBuffer) {
                statusDiv.textContent = "Please load an audio file first";
                return;
            }
            
            initAudioContext();
            
            // Stop any existing playback
            if (sourceNode) {
                sourceNode.stop();
            }
            
            // Reset pitch state
            playbackRate = 1.0;
            isHighPitch = false;
            updateVisuals(playbackRate);
            
            // Create audio source
            sourceNode = audioContext.createBufferSource();
            sourceNode.buffer = audioBuffer;
            sourceNode.playbackRate.value = playbackRate;
            sourceNode.connect(audioContext.destination);
            
            // Start playback
            sourceNode.start();
            statusDiv.textContent = "Playing... Pitch will modulate every 5 seconds";
            
            // Set up interval to modulate pitch
            intervalId = setInterval(function() {
                isHighPitch = !isHighPitch;
                playbackRate = isHighPitch ? 5.0 : 1.0;
                sourceNode.playbackRate.value = playbackRate;
                
                updateVisuals(playbackRate);
                
                statusDiv.textContent = isHighPitch 
                    ? `Pitch increased to ${playbackRate.toFixed(1)}x` 
                    : `Pitch returned to normal (${playbackRate.toFixed(1)}x)`;
                
            }, 5000); // Change every 5 seconds
        });
        
        // Stop playback
        stopBtn.addEventListener('click', function() {
            if (sourceNode) {
                sourceNode.stop();
                sourceNode = null;
            }
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
            statusDiv.textContent = "Playback stopped";
            updateVisuals(1.0);
        });
        
        // Wave animation keyframes
        const styleSheet = document.styleSheets[0];
        styleSheet.insertRule(`
            @keyframes waveAnimation {
                0% { background-position-x: 0; }
                100% { background-position-x: 33px; }
            }
        `, styleSheet.cssRules.length);
