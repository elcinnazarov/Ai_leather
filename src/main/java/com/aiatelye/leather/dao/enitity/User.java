package com.aiatelye.leather.dao.enitity;
import com.aiatelye.leather.enums.Enums;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@Data
public class User{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String name;

    @Column(name = "whatsapp_number", nullable = false)
    private String whatsappNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Enums.UserRole role;

    @Enumerated(EnumType.STRING)
    private Enums.AuthProvider provider;// Local veya Google

    @Column(name = "oauth_id")
    private String oauthId; // Google user ID

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Favorite> favorites;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Order> orders;

    
}
