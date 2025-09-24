import bcrypt from 'bcrypt';

const hashmapPassword = async (password: string): Promise<string> => {
    try {
        const hashedPassword = await bcrypt.hash(password, 10); 
        return hashedPassword;
    } catch (error) {
        throw new Error("Error hashing password");
    }
};

export default hashmapPassword;


