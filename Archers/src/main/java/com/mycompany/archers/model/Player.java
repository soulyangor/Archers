package com.mycompany.archers.model;

import java.util.Objects;

/**
 *
 * @author Sokolov
 */
public class Player {

    public float x;
    public float y;
    public float hp = 100;
    public float speed = 2;
    public float attackSpeed = 5;

    public float damage = 10;
    public float viewRange = 200;
    public float attackRange = 150;
    public float bulletSpeed = 5;

    public int state = 0;
    public double walkAngle = 1.5 * Math.PI;  //направление движения 
    public double attackAngle = 0;  //направление атаки 
    public int curFrame = 0;  //текущий кадр анимации
    public boolean isWalk = false;      //флаг движения
    public boolean isAttack = false;    //флаг атаки
    public boolean bckAttack = false;   //флаг обратного движения при атаке
    
    public String lastHitOwner = null;
    public int cost = 0;
    
    private String name;
    private String status;

    public Player() {
    }

    public Player(String name) {
        this.name = name;
        this.status = "created";
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setState(int x, int y, int size) {
        this.x = x * size + size / 2;
        this.y = y * size + size / 2;
    }

    public void respawn(Player player) {
        this.hp = 100;
        this.speed = 2;
        this.attackSpeed = player.attackSpeed;

        this.cost = player.cost;
        
        this.damage = player.damage;
        this.viewRange = player.viewRange;
        this.attackRange = player.attackRange;
        this.bulletSpeed = player.bulletSpeed;

        this.state = 0;
        this.walkAngle = 1.5 * Math.PI;  //направление движения 
        this.attackAngle = 0;  //направление атаки 
        this.curFrame = 0;  //текущий кадр анимации
        this.isWalk = false;      //флаг движения
        this.isAttack = false;    //флаг атаки
        this.bckAttack = false;   //флаг обратного движения при атаке
        
        //this.lastHitOwner = null;
    }

    public void update(Player player) {
        this.x = player.x;
        this.y = player.y;
        this.hp = player.hp;
        this.speed = player.speed;
        this.attackSpeed = player.attackSpeed;

        this.damage = player.damage;
        this.viewRange = player.viewRange;
        this.attackRange = player.attackRange;
        this.bulletSpeed = player.bulletSpeed;

        this.state = player.state;
        this.walkAngle = player.walkAngle;
        this.attackAngle = player.attackAngle;
        this.curFrame = player.curFrame;
        this.isWalk = player.isWalk;
        this.isAttack = player.isAttack;
        this.bckAttack = player.bckAttack;
        
        this.lastHitOwner = player.lastHitOwner;
    }

    @Override
    public int hashCode() {
        int hash = 7;
        hash = 29 * hash + Objects.hashCode(this.name);
        return hash;
    }

    @Override
    public boolean equals(Object obj) {
        if (obj == null) {
            return false;
        }
        if (getClass() != obj.getClass()) {
            return false;
        }
        final Player other = (Player) obj;
        if (!Objects.equals(this.name, other.name)) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "Player{" + "name=" + name + ", status=" + status + '}';
    }

}
