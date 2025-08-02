import crypto from 'crypto';
import axios from "axios";

// Set your encryption algorithm and key
const algorithm = 'aes-128-ctr'; // AES-128 in CTR mode
const rawKey = process.env.ENCRYPT_DATA_SECRET_KEY;
const key = Buffer.from(rawKey); // 128-bit key (must be 16 bytes long)


// Function to encrypt data
export const encryptData = (data) => {
    const iv = crypto.randomBytes(16); // Generate a new initialization vector
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Return only the encrypted data as a string
    return `${iv.toString('hex')}:${encrypted}`; // Concatenate IV and encrypted data
};



// Function to decrypt data
export const decryptData = (encryptedString) => {
    const [iv, encryptedData] = encryptedString.split(':'); // Split IV and encrypted data
    const decipher = crypto.createDecipheriv(
        algorithm,
        key,
        Buffer.from(iv, 'hex') // Convert IV from hex back to buffer
    );
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted; // Return the decrypted string
};



//generate random code
export const randomCode = async (length) => {
        let code = '';
        while (code.length < length) {
                code += Math.random().toString(36).substring(2);
        }
        return code.substring(0, length);
}


// Generate a random number with the specified length
export const randomNumber = async (length) => {
    let code = '';
    while (code.length < length) {
        // Generate a random digit between 0 and 9
        code += Math.floor(Math.random() * 10).toString();
    }
    return code;
};



//get realtime token price from binance API
export const getRealTimeTokenPriceBinance = async (token,tokenPriceIn)=>{
    try 
    {
        const symbol = token+tokenPriceIn
        // Binance API endpoint for getting the current price
        const response = await axios.get(`https://api.binance.com/api/v3/ticker/price`, {
          params: {
            symbol: symbol
          }
        });
        console.log("symbol",symbol);
        // Display the current price
        console.log(`The current price of ${symbol} is: $${response.data.price}`);
        return response.data.price;
    } 
    catch (error)
    {
        console.error("Error fetching token price:", error.message);
        throw error;
    }
}
