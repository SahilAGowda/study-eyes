# Voice Enrollment Troubleshooting Guide

## Issue: "Insufficient speech samples. Got 0, need 30"

This error means the system isn't detecting your voice during enrollment. Here's how to fix it:

### ✅ Quick Fixes

1. **Check Microphone Permissions**
   - Make sure your browser has microphone access
   - Look for the microphone icon in your browser's address bar
   - Click it and ensure permissions are granted

2. **Speak Louder**
   - The system needs to detect your voice above background noise
   - Speak at normal conversation volume or slightly louder
   - Don't whisper - speak clearly and continuously

3. **Get Closer to Microphone**
   - Move closer to your device's microphone
   - If using external mic, position it 6-12 inches from your mouth

4. **Reduce Background Noise**
   - Close windows to reduce outside noise
   - Turn off fans, AC, or other noise sources
   - Move to a quieter room if possible

5. **Wait for Calibration**
   - The system calibrates for 3 seconds before enrollment
   - Make sure you see "Ready to enroll" before starting
   - Don't speak during the calibration phase

### 🎤 During Enrollment

**DO:**
- ✅ Speak continuously for the full 12 seconds
- ✅ Speak at normal conversation volume
- ✅ Read text aloud or count numbers
- ✅ Maintain consistent volume
- ✅ Stay close to the microphone

**DON'T:**
- ❌ Whisper or speak too softly
- ❌ Take long pauses
- ❌ Move away from the microphone
- ❌ Have background music or TV on
- ❌ Let others speak during enrollment

### 🔧 Technical Checks

1. **Test Your Microphone**
   ```
   - Open browser console (F12)
   - Look for messages like "Enrollment sample collected: X"
   - If you see these messages, your mic is working
   ```

2. **Check Audio Levels**
   ```
   - Look for console messages showing audio levels
   - Should see: "audioLevel: 0.05+" when speaking
   - If levels are too low (< 0.01), speak louder
   ```

3. **Browser Compatibility**
   - Works best in Chrome, Edge, or Firefox
   - Safari may have issues - try Chrome instead
   - Make sure browser is up to date

### 📊 What the System Needs

The enrollment system needs to collect **at least 30 speech samples** in 12 seconds:
- That's about 2.5 samples per second
- Each sample is captured every 100ms when speech is detected
- If you speak continuously, you'll easily get 100+ samples

### 🐛 Debug Mode

To see what's happening:

1. Open browser console (F12)
2. Start enrollment
3. Look for these messages:
   - "Enrollment sample collected: X" - Good! System is detecting speech
   - "Waiting for speech..." - System isn't detecting your voice yet
   - "audioLevel: X, speechEnergy: Y" - Shows your audio levels

### 💡 Pro Tips

1. **Practice First**
   - Before clicking "Start Enrollment", practice speaking
   - Watch the Audio Activity indicator
   - Make sure it shows you're speaking

2. **What to Say**
   - Count from 1 to 50
   - Read a paragraph from a book
   - Describe what you see around you
   - Recite the alphabet

3. **Optimal Setup**
   - Quiet room
   - 6-12 inches from microphone
   - Normal speaking volume
   - No background noise

### 🔄 If It Still Doesn't Work

1. **Refresh the page** and try again
2. **Restart your browser**
3. **Try a different browser** (Chrome recommended)
4. **Check system microphone settings**:
   - Windows: Settings > Privacy > Microphone
   - Mac: System Preferences > Security & Privacy > Microphone
5. **Test microphone** in another app (Zoom, Discord, etc.)

### 📞 Still Having Issues?

Check the browser console for error messages:
1. Press F12 to open developer tools
2. Click "Console" tab
3. Look for red error messages
4. Share these with support if needed

## Common Error Messages

### "Got 0, need 30"
- **Cause**: No speech detected at all
- **Fix**: Speak louder, check microphone permissions

### "Got 5, need 30"
- **Cause**: Some speech detected but not enough
- **Fix**: Speak more continuously, reduce pauses

### "Got 15, need 30"
- **Cause**: Speech detected but inconsistent
- **Fix**: Maintain consistent volume, speak continuously

### "Microphone access denied"
- **Cause**: Browser doesn't have mic permissions
- **Fix**: Grant permissions in browser settings

## Success Indicators

You'll know it's working when:
- ✅ Console shows "Enrollment sample collected: X" messages
- ✅ Progress bar moves smoothly
- ✅ Sample count increases steadily
- ✅ You reach 30+ samples before time runs out

## Changes Made to Improve Detection

We've made the system more sensitive:
- ✅ Reduced minimum samples from 100 to 30
- ✅ Lowered speech detection threshold during enrollment
- ✅ Added better logging for debugging
- ✅ Made enrollment more lenient (OR logic instead of AND)
- ✅ Improved audio level detection

Try enrolling again - it should work much better now!
