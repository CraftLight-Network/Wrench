package games.backlight.wrench;

import javax.security.auth.login.LoginException;

public class Main {
    public static void main(String[] args) {
        try {
            new Wrench();
        } catch (LoginException e) {
            System.out.println(e.getMessage());
        }
    }
}
