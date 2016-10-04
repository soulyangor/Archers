package com.mycompany.archers.model;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Service;

/**
 *
 * @author Sokolov
 */
@Service("GameModel")
public class GameModel {

    private final Map<String, Unit> players = new HashMap<>();
    private final Map<String, Game> games = new HashMap<>();

    public GameModel() {
    }

    public Set<Unit> getPlayers() {
        Set<Unit> result = new HashSet<>();
        for (String key : players.keySet()) {
            result.add(players.get(key));
        }
        return result;
    }

    public Set<Game> getGames(String status) {
        Set<Game> result = new HashSet<>();
        for (String key : games.keySet()) {
            Game game = games.get(key);
            if (game.getStatus().equals(status)) {
                result.add(game);
            }
        }
        return result;
    }

    public void addPlayer(Unit player) {
        players.put(player.getName(), player);
    }

    public void removePlayer(Unit player) {
        players.remove(player.getName());
    }

    public boolean isPlayerExist(Unit player) {
        return players.containsKey(player.getName());
    }

    public void addGame(Game game) {
        game.setStatus("created");
        Unit host = game.getHost();
        Unit player = players.get(host.getName());
        player.setStatus(host.getStatus());
        games.put(game.getName(), game);
    }

    public void removeGame(Game game) {
        games.remove(game.getName());
    }

    public void connectPlayer(Game game, Unit player) {
        Unit p = players.get(player.getName());
        Game g = games.get(game.getName());
        g.addPlayer(p);
    }

    public Game getGame(String name) {
        return games.get(name);
    }

    public Unit getPlayer(String name) {
        return players.get(name);
    }

}
