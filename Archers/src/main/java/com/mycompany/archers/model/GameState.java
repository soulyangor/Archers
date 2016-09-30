package com.mycompany.archers.model;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;

/**
 *
 * @author Sokolov
 */
public class GameState {

    public final int mapWidth = 40;
    public final int mapHeight = 40;

    public String name;

    public Set<Wall> walls = new HashSet<>();
    public Set<Bush> bushes = new HashSet<>();

    public Set<Player> players = new HashSet<>();

    private static final List<MapPoint> positions = new ArrayList<>();

    static {
        positions.add(new MapPoint(3, 3));
        positions.add(new MapPoint(36, 36));
        positions.add(new MapPoint(3, 36));
        positions.add(new MapPoint(36, 3));
        positions.add(new MapPoint(3, 20));
        positions.add(new MapPoint(20, 3));
        positions.add(new MapPoint(36, 20));
        positions.add(new MapPoint(20, 36));
        positions.add(new MapPoint(20, 20));
        positions.add(new MapPoint(15, 12));
    }

    private static final int WALL_FREQUENCY = 25;  // 3 / 25
    private static final int BUSH_FREQUENCY = 30; // 2 / 30

    private static final int CELL_SIZE = 64;

    public GameState() {
    }

    public GameState(String name) {
        this.name = name;
    }

    public void generateEnvironment() {
        for (int i = 0; i < mapWidth; i++) {
            for (int j = 0; j < mapHeight; j++) {
                if (i == 0 || j == 0 || i == mapWidth - 1 || j == mapHeight - 1) {
                    walls.add(new Wall(i, j, 3));
                }
                int wallType = (new Random()).nextInt(WALL_FREQUENCY);
                int bushType = (new Random()).nextInt(BUSH_FREQUENCY);
                Wall wall = new Wall(i, j, wallType);
                if (wallType < 3 && !positions.contains(new MapPoint(i, j))) {
                    walls.add(wall);
                }
                if (bushType < 2) {
                    bushes.add(new Bush(i, j, bushType));
                }
            }
        }
    }

    public void defPlayersPosition(Set<Player> players) {
        this.players = players;
        for (Player player : this.players) {
            int index = (new Random()).nextInt(10);
            MapPoint point = positions.get(index);
            player.setState(point.x, point.y, CELL_SIZE);
        }
    }

    public void respawnPlayer(Player player) {
        player.respawn(player);
        int index = (new Random()).nextInt(10);
        MapPoint point = positions.get(index);
        player.setState(point.x, point.y, CELL_SIZE);
    }

}
