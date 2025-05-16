package aloui.bilal.userauthservice.security;

import org.mindrot.jbcrypt.BCrypt;

public class PasswordUtil {

    // Define the BCrypt workload (higher = more secure, but slower)
    private static final int WORKLOAD = 12;

    /**
     * Hash the password using BCrypt
     */
    public static String hashPassword(String plainPassword) {
        return BCrypt.hashpw(plainPassword, BCrypt.gensalt(WORKLOAD));
    }

    /**
     * Verify a plaintext password against the hashed one.
     */
    public static boolean verifyPassword(String plainPassword, String hashedPassword) {
        if (hashedPassword == null || !hashedPassword.startsWith("$2a$")) {
            throw new IllegalArgumentException("Invalid hashed password");
        }
        return BCrypt.checkpw(plainPassword, hashedPassword);
    }

}
