define(['knockout', 'ko-mapping'],function(ko, mapping) {
    var Rule = function(data) {
        mapping.fromJS({
            ports: [],
            priority: '100',
            tcp: true,
            udp: false,
            icmp: false,
            action: 'accept'
        }, {}, this);
        mapping.fromJS(data, {}, this);

        this.ports_config = {
            placeholder: 'Enter ports to apply rule to.',
                tags: [],
                tokenSeparators: [',', ' ']
        }
    };
    return Rule;
});
