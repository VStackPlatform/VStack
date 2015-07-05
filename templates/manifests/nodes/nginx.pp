if $nginx == undef { $nginx = hiera('nginx') }

include nginx

each( $nginx['servers'] ) |$server| {

  nginx::server { $server['server_name']:
    content => $server['content']
  }
  each( $server['locations'] ) |$key, $location| {

    nginx::server::location { sprintf("%s-%s", $server['server_name'], $key):
      location => $location['path'],
      server   => Nginx::Server[$server['server_name']],
      content  => $location['content']
    }
  }
}