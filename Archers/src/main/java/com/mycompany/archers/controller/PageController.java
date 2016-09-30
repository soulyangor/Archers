package com.mycompany.archers.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class PageController {

    public static final String LOGIN_PAGE_PATH = "/login";
    public static final String MAIN_PAGE_PATH = "/main";
    public static final String GAME_PANEL_PAGE_PATH = "/game_panel";
    public static final String GAME_PAGE_PATH = "/game";

    @RequestMapping("/")
    public String getDefaultPage() {
        return "login";
    }

    @RequestMapping(LOGIN_PAGE_PATH)
    public String getLoginPage() {
        return "login";
    }

    @RequestMapping(MAIN_PAGE_PATH)
    public String getMainPage() {
        return "main";
    }

    @RequestMapping(GAME_PANEL_PAGE_PATH)
    public String getGamePanelPage() {
        return "game_panel";
    }

    @RequestMapping(GAME_PAGE_PATH)
    public String getGamePage() {
        return "game";
    }

}
