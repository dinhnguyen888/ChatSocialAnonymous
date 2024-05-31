import bcrypt from 'bcrypt';

const hashmapPassword = async (password: string): Promise<string> => {
    // try {
    //     let hashedPassword = new Map();
    //     return hashedPassword.set(password,10).toString();
    // }
    // catch (error){
    //     throw new Error("errror hashing password")
    // }
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10); 
        return hashedPassword;
    } catch (error) {
        throw new Error("Error hashing password");
    }
};

export default hashmapPassword;
