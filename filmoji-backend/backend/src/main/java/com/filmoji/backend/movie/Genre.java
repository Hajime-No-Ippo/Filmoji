package com.filmoji.backend.movie;

import jakarta.persistence.*;
import java.util.Set;

@Entity
@Table(name = "genres")
public class Genre {

    @Id
    private Integer id;

    @Column(nullable = false, length = 100)
    private String name;

    // ── Getters & Setters ──

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}