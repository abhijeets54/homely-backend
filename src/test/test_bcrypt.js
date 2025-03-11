const bcrypt = require('bcryptjs');

const enteredPassword = "securepassword123"; // Your input password
const storedHash = "$2b$10$TjtpYlFLEXCQy/YYtUvtKeSd1ClVeCjs2nrRy1y.P0jdchIa18Uha"; // Copy from MongoDB

async function testPassword() {
    console.log("🔄 Rehashing the entered password...");
    const newHashedPassword = await bcrypt.hash(enteredPassword, 10);
    console.log("🆕 New Hashed Password:", newHashedPassword);

    console.log("🔄 Comparing stored hash with entered password...");
    const isMatch = await bcrypt.compare(enteredPassword, storedHash);
    console.log("✅ Password Match:", isMatch);
}

testPassword();