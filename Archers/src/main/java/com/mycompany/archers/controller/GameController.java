package com.mycompany.archers.controller;

import com.mycompany.archers.model.Command;
import com.mycompany.archers.model.Game;
import com.mycompany.archers.model.GameModel;
import com.mycompany.archers.model.Unit;
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
public class GameController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private GameModel gameModel;

    @MessageMapping("/game_data")
    public void sendPlayersList(Command command) throws Exception {
        String path = "/archers/" + command.game.getName() + "_data";
        Game game = gameModel.getGame(command.game.getName());
        if (command.name.equals("get_start_state")) {
            command.game = game;
            messagingTemplate.convertAndSend(path, command);
            return;
        }
        if (command.name.equals("death")) {
            Unit player = command.player;
            game.gameState.respawnPlayer(player);
            command.player = player;
            command.name = "respawn";
            messagingTemplate.convertAndSend(path, command);
            return;
        }
        if (command.name.equals("create_bot")) {
            Unit bot = game.gameState.createBot();
            command.player = bot;
            command.game = null;
            messagingTemplate.convertAndSend(path, command);
            return;
        }
        /*if (command.name.equals("update")) {
            boolean isUpdated = game.getPlayer(command.player.getName())
                    .update(command.player);
           if (!isUpdated) {
                messagingTemplate.convertAndSend(path, "getData");
            
            return;
        }
        if (command.name.equals("synchronize")) {
            messagingTemplate.convertAndSend(path, "getData");
            return;
        }*/
        messagingTemplate.convertAndSend(path, command);
    }

    /*@Scheduled(fixedDelay = 16)
    private void sendPlayersData() {
        for (Game game : gameModel.getGames("started")) {
            String path = "/archers/" + game.getName() + "_data";
            for (Unit player : game.getPlayers()) {
                Command command = new Command();
                command.name = "update";
                command.player = player;
                command.game = null;
                messagingTemplate.convertAndSend(path, command);
            }
        }
    }*/
}
