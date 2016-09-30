package com.mycompany.archers.model;

/**
 *
 * @author Sokolov
 */
public class Wall extends MapPoint {

    public final int type;

    public Wall(int x, int y, int type) {
        super(x, y);
        this.type = type;
    }
}
