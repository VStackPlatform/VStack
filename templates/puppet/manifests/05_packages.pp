if $packages == undef { $packages = hiera_array('packages', false) }
each( $packages ) |$package| {
  if ! defined(Package[$package]) {
    package { $package:
      ensure => present,
    }
  }
}
