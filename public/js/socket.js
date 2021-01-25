const socket = io.connect({ 'reconnectionDelay': 1000, 'reconnectionAttempts': 10 });

export default socket;