function AdminList({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-4xl gap-2 flex flex-col py-8 px-4">
      {children}
    </div>
  );
}

function AdminListHeading({
  controls,
  label,
}: {
  controls: React.ReactNode;
  label: string | React.ReactNode;
}) {
  return (
    <>
      <h2 className="text-2xl font-semibold">{label}</h2>
      <div className="flex gap-2 items-center flex-wrap">{controls}</div>
    </>
  );
}

AdminList.Heading = AdminListHeading;

export default AdminList;
