package com.freshmart.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "alerts")
public class Alert {
    
    public enum AlertType {
        LOW_STOCK, EXPIRING
    }
    
    public enum Priority {
        HIGH, MEDIUM, LOW
    }
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "alert_id")
    private Long alertId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "alert_type", nullable = false, length = 20)
    private AlertType alertType;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false, length = 10)
    private Priority priority;
    
    @Column(name = "message", nullable = false, length = 500)
    private String message;
    
    @Column(name = "suggested_discount")
    private Integer suggestedDiscount;
    
    @Column(name = "is_dismissed")
    private Boolean isDismissed = false;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "dismissed_at")
    private LocalDateTime dismissedAt;
    
    // Getters and Setters
    public Long getAlertId() { return alertId; }
    public void setAlertId(Long alertId) { this.alertId = alertId; }
    
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    
    public Store getStore() { return store; }
    public void setStore(Store store) { this.store = store; }
    
    public AlertType getAlertType() { return alertType; }
    public void setAlertType(AlertType alertType) { this.alertType = alertType; }
    
    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public Integer getSuggestedDiscount() { return suggestedDiscount; }
    public void setSuggestedDiscount(Integer suggestedDiscount) { this.suggestedDiscount = suggestedDiscount; }
    
    public Boolean getIsDismissed() { return isDismissed; }
    public void setIsDismissed(Boolean isDismissed) { this.isDismissed = isDismissed; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getDismissedAt() { return dismissedAt; }
    public void setDismissedAt(LocalDateTime dismissedAt) { this.dismissedAt = dismissedAt; }
}
