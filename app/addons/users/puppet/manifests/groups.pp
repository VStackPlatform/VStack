if $users == undef { $users = hiera('users') }

each( $users['groups'] ) |$group| {
  if ! defined(Group[$group]) {
    group { $group:
      ensure => present
    }
  }
}