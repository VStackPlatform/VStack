if $packages == undef { $packages = hiera('packages', false) }
each( $packages['packages'] ) |$package| {
  if ! defined(Package[$package]) {
    package { $package:
      ensure => present,
    }
  }
}
