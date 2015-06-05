class { 'redis':
  require => Class['apt'],
}