## Create first and last stages for easier maintenance.
stage { 'first':
  before => Stage['main'],
}
stage { 'last': }
Stage['main'] -> Stage['last']

class { 'apt': }

import 'nodes/*.pp'

