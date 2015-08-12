if $users == undef { $users = hiera('users') }

each( $users ) |$user| {
  if ! defined(User[$user]) {
    user { $user:
      ensure     => present,
      shell      => '/bin/bash',
      home       => "/home/${user}",
      managehome => true
    }
  }
}
