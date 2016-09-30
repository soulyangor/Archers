package com.mycompany.archers.controller;

import com.mycompany.archers.model.Command;
import com.mycompany.archers.model.Game;
import com.mycompany.archers.model.GameModel;
import com.mycompany.archers.model.Player;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Controller;

/**
 *
 * @author Sokolov
 */
@Controller
public class GamePanelPageController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private GameModel gameModel;

    @MessageMapping("/game_info")
    public void sendPlayersList(Command command) throws Exception {
        String path = "/archers/" + command.game.getName() + "_info";
        Game game = gameModel.getGame(command.game.getName());
        if (command.name.equals("get_game_players")) {
            messagingTemplate.convertAndSend(path, game);
        }
        if (command.name.equals("ready")) {
            Player player = game.getPlayer(command.player.getName());
            player.setStatus("готов");
            messagingTemplate.convertAndSend(path, game);
        }
        if (command.name.equals("start")) {
            game.generateStartGameState();
            for (Player player : game.getPlayers()) {
                player.setStatus("в игре");
            }
            messagingTemplate.convertAndSend(path, command);
        }
    }    

}
