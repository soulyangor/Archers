package com.mycompany.archers.model;

/**
 *
 * @author Sokolov
 */
public class Bush extends MapPoint{

    public final int type;
    
    public Bush(int x, int y, int type) {
        super(x, y);
        this.type = type;
    }
    
}
