package com.freshmart.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "stores")
public class Store {
    
    @Id
    @Column(name = "store_id")
    private Integer storeId;
    
    @Column(name = "store_name", nullable = false, length = 100)
    private String storeName;
    
    @Column(name = "street", length = 200)
    private String street;
    
    @Column(name = "city", nullable = false, length = 100)
    private String city;
    
    @Column(name = "state", nullable = false, length = 2)
    private String state;
    
    @Column(name = "zip_code", length = 10)
    private String zipCode;
    
    @Column(name = "phone", length = 20)
    private String phone;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    // Getters and Setters
    public Integer getStoreId() { return storeId; }
    public void setStoreId(Integer storeId) { this.storeId = storeId; }
    
    public String getStoreName() { return storeName; }
    public void setStoreName(String storeName) { this.storeName = storeName; }
    
    public String getStreet() { return street; }
    public void setStreet(String street) { this.street = street; }
    
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    
    public String getZipCode() { return zipCode; }
    public void setZipCode(String zipCode) { this.zipCode = zipCode; }
    
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
}
