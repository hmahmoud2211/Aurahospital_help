# 🏥 Aura Hospital Login Debug Guide

## ✅ **Issues Fixed:**

### 1. **Backend Connection Issue**
- **Problem**: Frontend was trying to connect to `127.0.0.1:8000`
- **Solution**: Updated to use your computer's IP address `192.168.1.11:8000`
- **File Updated**: `store/auth-store.ts`

### 2. **Content-Type Mismatch**
- **Problem**: Frontend was sending `multipart/form-data`, backend expected `application/x-www-form-urlencoded`
- **Solution**: Changed to use `URLSearchParams` and correct Content-Type
- **File Updated**: `store/auth-store.ts`

### 3. **Login Screen Not Connected**
- **Problem**: LoginScreen.js was just a UI template without actual login functionality
- **Solution**: Connected to auth store with proper state management
- **File Updated**: `screens/LoginScreen.js`

## 🔧 **Current Configuration:**

### Backend Server:
- **URL**: `http://192.168.1.11:8000`
- **Status**: ✅ Running and accessible
- **Authentication**: ✅ Working (tested via API)

### Frontend Auth Store:
- **API URL**: `http://192.168.1.11:8000`
- **Content-Type**: `application/x-www-form-urlencoded`
- **Timeout**: 10 seconds
- **Logging**: ✅ Enabled for debugging

### Test Credentials:
- **Email**: `nurse@test.com`
- **Password**: `password123`
- **Role**: `nurse`

## 🧪 **Testing Steps:**

1. **Backend Test** (✅ Confirmed Working):
   ```bash
   Invoke-WebRequest -Uri "http://192.168.1.11:8000/auth/token" -Method POST -Headers @{"Content-Type"="application/x-www-form-urlencoded"} -Body "username=nurse@test.com&password=password123"
   ```

2. **Frontend Test**:
   - Open your React Native app
   - Use the demo credentials button or enter manually:
     - Email: `nurse@test.com`
     - Password: `password123`
   - Watch console logs for debugging info

## 🔍 **Debugging Tips:**

### If Login Still Fails:

1. **Check Console Logs**:
   - Look for `🔐 Starting login attempt for:` messages
   - Check for network errors or timeouts

2. **Network Issues**:
   - Ensure your device/emulator is on the same network as your computer
   - Try using your computer's actual IP address instead of `192.168.1.11`

3. **Firewall Issues**:
   - Windows Firewall might be blocking port 8000
   - Try temporarily disabling firewall or add an exception

4. **Alternative Solutions**:
   - Use ngrok to create a tunnel: `ngrok http 8000`
   - Update API_URL to the ngrok URL

## 📱 **Expected Behavior:**

1. **Before Login**: Button shows "Login"
2. **During Login**: Button shows "Logging in..." with spinner
3. **Success**: Navigates to home screen
4. **Error**: Shows alert with error message

## 🚨 **Common Error Messages:**

- **"Network Error"**: Check if backend is running and accessible
- **"Timeout"**: Network connection too slow or blocked
- **"Incorrect email or password"**: Wrong credentials
- **"Login failed - please check your connection"**: General connection issue

## 📋 **Quick Fix Checklist:**

- [ ] Backend server running on `http://192.168.1.11:8000`
- [ ] Auth store using correct IP address
- [ ] Content-Type set to `application/x-www-form-urlencoded`
- [ ] LoginScreen.js connected to auth store
- [ ] Test credentials: `nurse@test.com` / `password123`
- [ ] Console logs enabled for debugging
- [ ] Device/emulator on same network as development machine 