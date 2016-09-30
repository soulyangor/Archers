package com.mycompany.archers.model;

import java.util.HashSet;
import java.util.Set;

/**
 *
 * @author Sokolov
 */
public class Game {

    public GameState gameState;

    private String name;
    private String status;
    private int playersCount;

    private Player host;

    private final Set<Player> players = new HashSet<>();

    public Game() {
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

    public int getPlayersCount() {
        return playersCount;
    }

    public void setPlayersCount(int playersCount) {
        this.playersCount = playersCount > 0 && playersCount <= 10
                ? playersCount : 1;
    }

    public Player getHost() {
        return host;
    }

    public void setHost(Player host) {
        this.host = host;
        if (host != null) {
            host.setStatus("ожидает начала игры");
            addPlayer(host);
        }
    }

    public Set<Player> getPlayers() {
        return players;
    }

    public void addPlayer(Player player) {
        if (players.size() < playersCount && !players.contains(player)) {
            player.setStatus("ожидает начала игры");
            players.add(player);
        }
    }

    public void removePlayer(Player player) {
        players.remove(player);
    }

    public Player getPlayer(String name) {
        for (Player player : players) {
            if (player.getName().equals(name)) {
                return player;
            }
        }
        return null;
    }

    public void generateStartGameState() {
        status = "started";
        gameState = new GameState("start_state");
        gameState.generateEnvironment();
        gameState.defPlayersPosition(players);
    }

}
