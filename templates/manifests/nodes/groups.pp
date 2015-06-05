if $groups == undef { $groups = hiera('groups') }

each( $groups ) |$group| {
  if ! defined(Group[$group]) {
    group { $group:
      ensure => present
    }
  }
}