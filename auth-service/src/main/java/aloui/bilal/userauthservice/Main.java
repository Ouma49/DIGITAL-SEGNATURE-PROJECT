
package aloui.bilal.userauthservice;

import aloui.bilal.userauthservice.service.auth.AuthService;
import io.helidon.config.Config;
import io.helidon.logging.common.LogConfig;
import io.helidon.webserver.WebServer;
import io.helidon.webserver.http.HttpRouting;
import io.helidon.webserver.cors.CorsSupport;

public class Main {


    private Main() {
    }


    public static void main(String[] args) throws Exception {

        // initialize global config from default configuration
        Config config = Config.create();

        // load logging configuration
        LogConfig.configureRuntime();

        WebServer server = WebServer.builder()
                .config(config.get("server"))
                .routing(Main::routing)
                .build()
                .start();


        System.out.println("WEB server is up! http://localhost:" + server.port());

    }

    static void routing(HttpRouting.Builder routing) {
        // Add CORS support
        CorsSupport cors = CorsSupport.builder()
                .allowOrigins("*")
                .allowMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowHeaders("*")
                .build();

        routing
                .register(cors)
                .register("/auth", new AuthService());
    }
}
