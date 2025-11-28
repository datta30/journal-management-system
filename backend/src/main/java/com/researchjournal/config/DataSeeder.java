package com.researchjournal.config;

import com.researchjournal.entity.User;
import com.researchjournal.entity.Role;
import com.researchjournal.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Create Admin if not exists
            if (!userRepository.existsByEmail("admin@journal.com")) {
                User admin = new User();
                admin.setFirstName("Admin");
                admin.setLastName("User");
                admin.setEmail("admin@journal.com");
                admin.setPassword(passwordEncoder.encode("password123"));
                admin.setRole(Role.ADMIN);
                admin.setEnabled(true);
                userRepository.save(admin);
                System.out.println("Created admin user: admin@journal.com / password123");
            }

            // Create Editor if not exists
            if (!userRepository.existsByEmail("editor@journal.com")) {
                User editor = new User();
                editor.setFirstName("Editor");
                editor.setLastName("User");
                editor.setEmail("editor@journal.com");
                editor.setPassword(passwordEncoder.encode("password123"));
                editor.setRole(Role.EDITOR);
                editor.setEnabled(true);
                userRepository.save(editor);
                System.out.println("Created editor user: editor@journal.com / password123");
            }

            // Create Reviewer if not exists
            if (!userRepository.existsByEmail("reviewer@journal.com")) {
                User reviewer = new User();
                reviewer.setFirstName("Reviewer");
                reviewer.setLastName("User");
                reviewer.setEmail("reviewer@journal.com");
                reviewer.setPassword(passwordEncoder.encode("password123"));
                reviewer.setRole(Role.REVIEWER);
                reviewer.setEnabled(true);
                userRepository.save(reviewer);
                System.out.println("Created reviewer user: reviewer@journal.com / password123");
            }
            
            // Create second Reviewer if not exists
            if (!userRepository.existsByEmail("reviewer2@journal.com")) {
                User reviewer2 = new User();
                reviewer2.setFirstName("Second");
                reviewer2.setLastName("Reviewer");
                reviewer2.setEmail("reviewer2@journal.com");
                reviewer2.setPassword(passwordEncoder.encode("password123"));
                reviewer2.setRole(Role.REVIEWER);
                reviewer2.setEnabled(true);
                userRepository.save(reviewer2);
                System.out.println("Created reviewer user: reviewer2@journal.com / password123");
            }

            // Create Author if not exists
            if (!userRepository.existsByEmail("author@journal.com")) {
                User author = new User();
                author.setFirstName("Author");
                author.setLastName("User");
                author.setEmail("author@journal.com");
                author.setPassword(passwordEncoder.encode("password123"));
                author.setRole(Role.AUTHOR);
                author.setEnabled(true);
                userRepository.save(author);
                System.out.println("Created author user: author@journal.com / password123");
            }
        };
    }
}
