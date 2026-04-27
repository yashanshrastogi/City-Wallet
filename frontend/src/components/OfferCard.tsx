interface Props {
  offer: {
    merchant: string;
    discount: string;
    item: string;
    context?: {
      temperature: number;
      day: string;
    };
  };
}

export default function OfferCard({ offer }: Props) {
  return (
    <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500 mt-6">
      <h3 className="font-bold text-lg">{offer.merchant}</h3>
      <p className="text-green-600 font-semibold">{offer.discount}</p>
      <p className="text-gray-600">{offer.item}</p>
      {offer.context && (
        <div className="mt-4 text-sm text-gray-500 border-t pt-2">
          <p>{offer.context.temperature}C • {offer.context.day}</p>
        </div>
      )}
    </div>
  );
}
