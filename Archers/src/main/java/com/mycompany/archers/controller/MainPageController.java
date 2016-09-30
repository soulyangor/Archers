package com.mycompany.archers.controller;

import com.mycompany.archers.model.Command;
import com.mycompany.archers.model.Game;
import com.mycompany.archers.model.GameModel;
import com.mycompany.archers.model.Player;
import java.util.Set;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

/**
 *
 * @author Sokolov
 */
@Controller
@RestController
public class MainPageController {

    @Autowired
    private GameModel gameModel;

    @MessageMapping("/players_info")
    @SendTo("/archers/players_list")
    public Set<Player> sendPlayersList(Command command) throws Exception {
        if (command.name.equals("get_players")) {
            return gameModel.getPlayers();
        }
        return null;
    }

    @MessageMapping("/games_info")
    @SendTo("/archers/games_list")
    public Set<Game> sendGamesList(Command command) throws Exception {
        if (command.name.equals("get_games")) {
            return gameModel.getGames("created");
        }
        return null;
    }

    @RequestMapping(method = RequestMethod.POST,
            path = "/games/item",
            produces = MediaType.APPLICATION_JSON_VALUE,
            consumes = MediaType.APPLICATION_JSON_VALUE)
    public Game createGame(@RequestBody Game game) {
        gameModel.addGame(game);
        return game;
    }

    @RequestMapping(method = RequestMethod.PUT,
            path = "/games/item",
            produces = MediaType.APPLICATION_JSON_VALUE,
            consumes = MediaType.APPLICATION_JSON_VALUE)
    public Game updateGame(@RequestBody Command command) {
        gameModel.connectPlayer(command.game, command.player);
        return command.game;
    }

}
