const {InstancesClient} = require('@google-cloud/compute').v1;
const functions = require('@google-cloud/functions-framework');

functions.http('listVMs', async (req, res) => {
  try {
    const computeClient = new InstancesClient();
    const projectId = await computeClient.getProjectId();

    const vms = [];
    const iterable = computeClient.aggregatedListAsync({ project: projectId });

    for await (const [zone, instancesObject] of iterable) {
      if (instancesObject.instances) {
        vms.push(...instancesObject.instances.map(i => ({ name: i.name, zone: zone.split('/').pop(), status: i.status })));
      }
    }
    res.set('Access-Control-Allow-Origin', '*');
    res.status(200).send(vms);
  } catch (err) {
    console.error('ERROR:', err);
    res.status(500).send({ error: 'Failed to list VMs', details: err.message });
  }
});
