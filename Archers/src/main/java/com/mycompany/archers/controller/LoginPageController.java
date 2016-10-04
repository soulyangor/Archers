package com.mycompany.archers.controller;

import com.mycompany.archers.model.GameModel;
import com.mycompany.archers.model.Unit;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

/**
 *
 * @author Sokolov
 */
@Controller
public class LoginPageController {

    @Autowired
    private GameModel gameModel;

    @MessageMapping("/login")
    @SendTo("/archers/login_response")
    public String sendLoginResult(Unit player) throws Exception {
        if (gameModel.isPlayerExist(player)) {
            return "fail";
        } else {
            player.setStatus("выбирает игру");
            gameModel.addPlayer(player);
            return "success";
        }
    }

}
