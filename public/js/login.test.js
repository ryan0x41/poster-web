// login.test.js

const usernameRegex = /^[a-z0-9_-]{4,}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

async function registerUser(username, email, password) {
    if (!username || !email || !password) {
        throw new Error("Missing fields");
    }
    return { message: "User registered" };
}

describe('Regex Validation Tests', () => {
    test('Valid username', () => {
        expect(usernameRegex.test('john_doe')).toBe(true);
    });

    test('Invalid username', () => {
        expect(usernameRegex.test('jo')).toBe(false);
    });

    test('Valid email', () => {
        expect(emailRegex.test('test@example.com')).toBe(true);
    });

    test('Invalid email', () => {
        expect(emailRegex.test('bad@email@com')).toBe(false);
    });

    test('Valid password', () => {
        expect(passwordRegex.test('Aa1@strong')).toBe(true);
    });

    test('Invalid password', () => {
        expect(passwordRegex.test('1234')).toBe(false);
    });
});

describe('registerUser function', () => {
    test('Registers user successfully', async () => {
        const res = await registerUser('testuser', 'test@email.com', 'Aa1@word');
        expect(res.message).toBe('User registered');
    });

    test('Fails with missing input', async () => {
        await expect(registerUser('', '', '')).rejects.toThrow('Missing fields');
    });
});

