package com.researchjournal.config;

import com.researchjournal.entity.Role;
import com.researchjournal.entity.User;
import com.researchjournal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) {
        // Create default admin user if not exists
        if (!userRepository.existsByEmail("admin@journal.com")) {
            User admin = User.builder()
                    .email("admin@journal.com")
                    .password(passwordEncoder.encode("admin123"))
                    .firstName("System")
                    .lastName("Administrator")
                    .role(Role.ADMIN)
                    .enabled(true)
                    .build();
            userRepository.save(admin);
            System.out.println("Default admin user created: admin@journal.com / admin123");
        }
        
        // Create default editor if not exists
        if (!userRepository.existsByEmail("editor@journal.com")) {
            User editor = User.builder()
                    .email("editor@journal.com")
                    .password(passwordEncoder.encode("editor123"))
                    .firstName("John")
                    .lastName("Editor")
                    .institution("Research Journal")
                    .role(Role.EDITOR)
                    .enabled(true)
                    .build();
            userRepository.save(editor);
            System.out.println("Default editor user created: editor@journal.com / editor123");
        }
        
        // Create default reviewer if not exists
        if (!userRepository.existsByEmail("reviewer@journal.com")) {
            User reviewer = User.builder()
                    .email("reviewer@journal.com")
                    .password(passwordEncoder.encode("reviewer123"))
                    .firstName("Jane")
                    .lastName("Reviewer")
                    .institution("University of Science")
                    .role(Role.REVIEWER)
                    .enabled(true)
                    .build();
            userRepository.save(reviewer);
            System.out.println("Default reviewer user created: reviewer@journal.com / reviewer123");
        }
        
        // Create default author if not exists
        if (!userRepository.existsByEmail("author@journal.com")) {
            User author = User.builder()
                    .email("author@journal.com")
                    .password(passwordEncoder.encode("author123"))
                    .firstName("Alice")
                    .lastName("Author")
                    .institution("Tech University")
                    .role(Role.AUTHOR)
                    .enabled(true)
                    .build();
            userRepository.save(author);
            System.out.println("Default author user created: author@journal.com / author123");
        }
    }
}
